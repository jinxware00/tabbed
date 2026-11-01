(function (Global) {
  'use strict';
  var base = new URL('../', document.currentScript.src);
  var kinds = { wallpaper: ['Wallpapers', 'filetype:bitmap'], gif: ['GIFs', 'filemime:gif'], video: ['Live wallpapers', 'filetype:video'], audio: ['Audio', 'filetype:audio'] };
  function node(tag, cls, text) { var el = document.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; }
  function button(label, action, cls) { var el = node('button', cls || 'ghost', label); el.type = 'button'; el.onclick = action; return el; }
  function plain(html) { return new DOMParser().parseFromString(html || '', 'text/html').body.textContent.trim(); }
  function safeUrl(value) { try { var url = new URL(value); if (url.protocol !== 'https:') return ''; [...url.searchParams.keys()].filter(k=>k.startsWith('utm_')).forEach(k=>url.searchParams.delete(k)); return url.href; } catch (_) { return ''; } }
  Global.MediaSearch = {
    Open: function (options) {
      var E = Global.Editor, accept = options.accept || 'image/*';
      var allowed = Object.keys(kinds).filter(k=> k === 'audio' ? accept.includes('audio') : k === 'video' ? accept.includes('video') : accept.includes('image'));
      var kind = allowed[0] || 'wallpaper', request, transfer, timer, generation = 0, offset = 0, closed = false, playing, pending = false;
      var body = node('div', 'media-search'), form = node('form', 'media-search-form'), input = node('input'), tabs = node('div', 'media-tabs');
      input.type = 'search'; input.placeholder = 'Search Wikimedia Commons'; input.setAttribute('aria-label', 'Search media'); input.autocomplete = 'off';
      var status = node('p', 'media-status'), grid = node('div', 'media-results'), detail = node('div', 'media-detail');
      status.setAttribute('role','status'); detail.hidden = true;
      var more = button('Load more', ()=>search(true)); more.hidden = true;
      form.append(input, button('Search', ()=>search(false), 'primary'));
      form.onsubmit = event=>{event.preventDefault(); search(false);};
      allowed.forEach(key=>{ var tab=button(kinds[key][0],()=>{kind=key;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===tab)));if(input.value.trim())search(false);else curated();});tab.setAttribute('aria-pressed',String(key===kind));tabs.appendChild(tab); });
      var suggestions=node('div','media-suggestions');
      ['aurora','mountains','city at night','cat','rain ambient'].forEach(term=>suggestions.appendChild(button(term,()=>{input.value=term;search(false);})));
      body.append(tabs,form,suggestions,status,grid,detail,more,node('p','media-provider','Search by Wikimedia Commons. Each result includes its creator, license, and source.'));
      var close = E.OpenModal('Find media', body), dialog = body.closest('dialog'); dialog.classList.add('media-dialog');
      function stopPreview() { if(playing){playing.pause?.();playing.removeAttribute('src');playing.load?.();playing=null;}detail.replaceChildren();detail.hidden=true; }
      dialog.addEventListener('close',()=>{closed=true;generation++;clearTimeout(timer);request?.abort();transfer?.abort();stopPreview();},{once:true});
      input.oninput=()=>{clearTimeout(timer);request?.abort();generation++;timer=setTimeout(()=>search(false),350);};
      function result(media) {
        var card=node('article','media-result'), art=button('',()=>preview(media),'media-result-art');art.setAttribute('aria-label','Preview '+media.title);
        // GIFs and videos use static posters only; never start a grid of animations.
        if(media.thumb && !/\.gif(?:[?#]|$)/i.test(media.thumb)){var img=node('img');img.src=media.thumb;img.loading='lazy';img.decoding='async';img.alt='';art.appendChild(img);}
        else art.appendChild(node('span','',kind==='audio'?'♫':kind==='gif'?'GIF':'▶'));
        var title=node('h4','',media.title), credit=node('p','media-credit',media.author+' · '+media.license);
        var source=node('a','media-source','Source');source.href=media.source;source.target='_blank';source.rel='noopener noreferrer';
        card.append(art,title,credit,source,button('Use '+media.title,()=>choose(media),'primary media-use'));grid.appendChild(card);
      }
      function curated() {
        request?.abort();generation++;grid.replaceChildren();stopPreview();more.hidden=true;offset=0;
        if(kind==='audio'||kind==='gif'){status.textContent='Search for '+(kind==='audio'?'music or sounds, such as “rain ambient”.':'an animation, such as “cat”.');return;}
        status.textContent='A few starting points. Search above for more.';
        Global.PROFILE_TEMPLATES.filter(t=>kind!=='video'||t.config.Background.Type==='video').forEach(t=>result({title:t.name,url:new URL(kind==='video'?t.config.Background.Video:t.config.Background.Image,base).href,thumb:new URL(t.thumbnail,base).href,mime:kind==='video'?'video/webm':'image/webp',author:t.id==='coast'?'Netha Hussain':'Unsplash contributor',license:t.id==='coast'?'CC0':'Unsplash License',source:t.mediaSource,local:true}));
      }
      async function search(append) {
        clearTimeout(timer);request?.abort();var turn=++generation,query=input.value.trim();
        if(!query){curated();return;}if(!append){offset=0;grid.replaceChildren();stopPreview();}
        request=new AbortController();more.hidden=true;status.textContent='Searching…';
        var params=new URLSearchParams({action:'query',generator:'search',gsrsearch:query+' '+kinds[kind][1],gsrnamespace:'6',gsrlimit:'12',gsroffset:String(offset),prop:'imageinfo',iiprop:'url|mime|size|extmetadata',iiurlwidth:'480',format:'json',origin:'*'});
        try {
          var response=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{signal:request.signal});if(!response.ok)throw new Error('Search failed');
          var data=await response.json();if(turn!==generation||closed)return;if(data.error)throw new Error('Search failed');
          var pages=Object.values(data.query?.pages||{}).sort((a,b)=>a.index-b.index),count=0;
          pages.forEach(page=>{var info=page.imageinfo?.[0];if(!info)return;var mime=info.mime||'',url=safeUrl(info.url),meta=info.extmetadata||{};
            var valid=kind==='audio'?/^(audio\/|application\/ogg)/.test(mime):kind==='video'?mime.startsWith('video/'):kind==='gif'?mime==='image/gif':mime.startsWith('image/');
            if(!valid||!url)return;count++;
            result({title:page.title.replace(/^File:/,''),url,thumb:safeUrl(info.thumburl||''),mime,author:plain(meta.Artist?.value)||'See source',license:plain(meta.LicenseShortName?.value)||'See source license',source:safeUrl(info.descriptionurl)||'https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title),size:info.size||0});
          });
          offset=data.continue?.gsroffset;more.hidden=offset===undefined;status.textContent=count?'Choose a result to preview or use.':'No matching files. Try another phrase.';
        } catch(error){if(error.name!=='AbortError'&&turn===generation&&!closed)status.textContent='Search is unavailable. Try again, or upload a file / use a URL.';}
      }
      function preview(media) {
        stopPreview();detail.hidden=false;detail.appendChild(node('h4','',media.title));
        var tag=/^(audio\/|application\/ogg)/.test(media.mime)?'audio':media.mime.startsWith('video/')?'video':'img';
        playing=node(tag);playing.src=media.url;if(tag==='img')playing.alt=media.title;else{playing.controls=true;playing.preload='metadata';if(tag==='video')playing.playsInline=true;}
        detail.append(playing,button('Close preview',stopPreview));detail.scrollIntoView({block:'nearest',behavior:'smooth'});
      }
      async function choose(media) {
        if(pending)return;if(media.size>80*1024*1024){status.textContent='This file is over 80 MB. Choose a smaller file for your profile.';return;}
        pending=true;transfer=new AbortController();status.textContent='Saving media…';grid.querySelectorAll('.media-use').forEach(b=>b.disabled=true);
        try {
          var url=media.url;
          if(media.local)url=new URL(media.url).pathname.replace(new URL(base).pathname,'');
          else {
            var response=await fetch(url,{signal:transfer.signal});if(!response.ok)throw new Error('Download failed');
            if(Number(response.headers.get('content-length'))>80*1024*1024)throw new Error('File too large');
            var blob=await response.blob();if(blob.size>80*1024*1024)throw new Error('File too large');if(closed)return;
            url=await Global.ProfileStore.addAsset(new Blob([blob],{type:media.mime}));
          }
          if(closed)return;
          var credits=E.State.Config.MediaCredits||[];if(!credits.some(c=>c.source===media.source&&c.title===media.title))credits.push({title:media.title,author:media.author,license:media.license,source:media.source});E.State.Config.MediaCredits=credits.slice(-100);
          options.onSelect(url,media);E.Toast('Media added');close();
        } catch(error){if(!closed)status.textContent='Could not save this file. Try a smaller result or upload it yourself.';}
        finally{pending=false;if(!closed)grid.querySelectorAll('.media-use').forEach(b=>b.disabled=false);}
      }
      curated();input.focus();
    }
  };
})(window);
