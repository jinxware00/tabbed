(function (Global) {
  'use strict';
  function node(tag, cls, text) { var el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el; }
  function find(root,key){return root.querySelector('[class*="'+key+'"]');}
  Global.ProfileSections={Attach:function(root,saved,config,cleanups){
    var viewport=root.querySelector('.ref-scroll') || saved.parentElement;
    var stage=saved.querySelector('.ref-stage'),nativeSections=Array.from(saved.querySelectorAll('[class*="tb-a7-42c2b4ef"]'));
    var first=nativeSections[0] || stage,volume=find(saved,'tb-90-2f1123ac');
    var music=saved.querySelector('[data-profile-role=music]');
    var widgets=[];
    ['server','clock','lastfm'].forEach(function(role){
      var el=saved.querySelector('[data-profile-role='+role+']');
      var enabled=role==='lastfm'?config.Portfolio.LastFm.Enabled:config.Widgets[role==='server'?'Discord':'Clock'].Enabled;
      if(el && enabled){var shell=el.closest('[class*="tb-78-fd8143c6"]') || el;widgets.push(shell);shell.remove();}
    });
    saved.querySelectorAll('.pf-widgets > .pf-widget').forEach(function(el){if(!el.classList.contains('pf-quote'))widgets.push(el);el.remove();});
    saved.querySelectorAll('.pf-widgets,[class*="tb-91-10a31676"],[data-reveal-part="scroll-indicator"]').forEach(el=>el.remove());
    if(music)music.remove();if(volume)volume.remove();first.remove();
    saved.replaceChildren();saved.classList.add('ref-deck');
    first.classList.add('ref-page','ref-profile-page','ref-stage');first.dataset.layout=config.Layout.Preset;
    var profileContent=node('div','ref-profile-content');profileContent.append.apply(profileContent,Array.from(first.childNodes));first.appendChild(profileContent);
    first.dataset.sectionLabel='Profile';first.tabIndex=-1;saved.appendChild(first);
    var pages=[first];
    function page(label){var section=node('section','ref-page ref-content-page');section.dataset.sectionLabel=label;section.tabIndex=-1;var body=node('div','ref-page-body');body.tabIndex=0;body.setAttribute('aria-label',label+' content');section.appendChild(body);saved.appendChild(section);pages.push(section);return body;}
    function heading(parent,text){var h=node('h2','ref-section-title',text);h.dataset.revealPart='section-title';parent.appendChild(h);}
    var about=config.Portfolio;
    if(about.AboutText || about.AboutDetails || about.Tags.length){
      var body=page('About');heading(body,about.AboutTitle||'About me');
      [about.AboutText,about.AboutDetails].filter(Boolean).forEach(function(text){var p=node('p','ref-about-text',text);p.dataset.revealPart='about-text';body.appendChild(p);});
      if(about.Tags.length){var tags=node('div','ref-interest-tags');tags.dataset.revealPart='about-tags';about.Tags.forEach(text=>tags.appendChild(node('span','',text)));body.appendChild(tags);}
    }
    if(about.LastFm.Enabled && !widgets.some(el=>el.matches('[data-profile-role=lastfm]'))){
      var fm=node('div','pf-widget ref-lastfm');fm.dataset.profileRole='lastfm';fm.append(node('strong','',about.LastFm.UserName),node('p','',about.LastFm.Scrobbles.toLocaleString()+' scrobbles · '+about.LastFm.Artists.toLocaleString()+' artists'));
      var link=node('a','pf-join','Last.fm');link.href='https://last.fm/user/'+encodeURIComponent(about.LastFm.UserName);link.target='_blank';link.rel='noopener noreferrer';fm.appendChild(link);widgets.push(fm);
    }
    if(widgets.length){var body=page('Widgets');heading(body,'A little more');var grid=node('div','ref-shared-widgets');widgets.forEach(function(widget){widget.classList.add('ref-widget-item');widget.dataset.revealPart='widget';grid.appendChild(widget);});body.appendChild(grid);}
    [0,1].forEach(function(index){var projects=about.Projects.filter(project=>project.Section===index);if(!projects.length)return;
      var label=about.ProjectTitles[index] || 'Projects',body=page(label);heading(body,label);var grid=node('div','ref-project-grid');
      projects.forEach(function(project){var card=node('a','ref-project-card');card.dataset.profileRole='project';card.dataset.revealPart='project-card-item';card.href=project.Url;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',project.Title);
        if(project.Image){var image=node('img');image.src=project.Image;image.alt='';image.loading='lazy';card.appendChild(image);}card.append(node('h3','',project.Title),node('p','',project.Description));grid.appendChild(card);});body.appendChild(grid);
    });
    if(config.Music.Enabled && music){var body=page('Music');heading(body,'Now playing');music.dataset.revealPart='music';body.appendChild(music);}
    if(config.Widgets.Quote.Enabled && config.Widgets.Quote.Text){var body=page('Quote'),quote=node('blockquote','ref-quote');quote.dataset.revealPart='quote';quote.append(node('p','',config.Widgets.Quote.Text),node('cite','',config.Widgets.Quote.Author));body.appendChild(quote);}
    if(volume)saved.appendChild(volume);
    var nav=node('nav','ref-section-nav');nav.dataset.profileRole='section-nav';nav.setAttribute('aria-label','Profile sections');nav.hidden=pages.length<2;
    var current=0,frame=0,scrollFrame=0,animating=false,lastWheel=-Infinity,wheelSum=0,touch;
    pages.forEach(function(section,index){section.dataset.profileSection=index;var dot=node('button','ref-section-dot');dot.type='button';dot.setAttribute('aria-label',section.dataset.sectionLabel);dot.title=section.dataset.sectionLabel;dot.onclick=()=>go(index);nav.appendChild(dot);});saved.appendChild(nav);
    viewport.classList.add('ref-paged');viewport.tabIndex=0;
    function top(index){return pages[index].getBoundingClientRect().top-viewport.getBoundingClientRect().top+viewport.scrollTop;}
    function update(){nav.childNodes.forEach(function(dot,index){dot.dataset.active=String(index===current);dot.setAttribute('aria-current',String(index===current));});viewport.dataset.activeSection=current;}
    function go(index){index=Math.max(0,Math.min(pages.length-1,index));cancelAnimationFrame(frame);var start=viewport.scrollTop,target=top(index),began=performance.now();current=index;update();
      if(root.classList.contains('pf-reduced-motion') || Math.abs(target-start)<1){viewport.scrollTop=target;animating=false;return;}
      animating=true;
      function step(now){var progress=Math.min(1,(now-began)/720),ease=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;viewport.scrollTop=start+(target-start)*ease;if(progress<1)frame=requestAnimationFrame(step);else animating=false;}
      frame=requestAnimationFrame(step);
    }
    function canScroll(target,delta){for(var el=target instanceof Element?target:null;el&&el!==viewport;el=el.parentElement){if(el.scrollHeight>el.clientHeight+2 && /auto|scroll/.test(getComputedStyle(el).overflowY)){if(delta>0?el.scrollTop+el.clientHeight<el.scrollHeight-2:el.scrollTop>2)return true;}}return false;}
    function wheel(event){if(event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY))return;var delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);if(canScroll(event.target,delta))return;event.preventDefault();var now=performance.now(),quiet=now-lastWheel>200;lastWheel=now;if(animating){wheelSum=null;return;}if(quiet)wheelSum=0;else if(wheelSum===null)return;wheelSum+=delta;if(Math.abs(wheelSum)>=18){go(current+Math.sign(wheelSum));wheelSum=null;}}
    function key(event){if(event.target.closest('a,button,input,textarea,select,[role=button],[role=slider],[contenteditable=true]'))return;var direction=event.key==='ArrowDown'||event.key==='PageDown'||event.key===' '&&!event.shiftKey?1:event.key==='ArrowUp'||event.key==='PageUp'||event.key===' '&&event.shiftKey?-1:0;
      if(direction && canScroll(event.target,direction))return;if(direction||event.key==='Home'||event.key==='End'){event.preventDefault();go(direction?current+direction:event.key==='Home'?0:pages.length-1);}}
    function touchStart(event){touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY,target:event.target,handled:false}:null;}
    function touchMove(event){if(!touch||event.touches.length!==1)return;var dy=touch.y-event.touches[0].clientY,dx=touch.x-event.touches[0].clientX;if(Math.abs(dx)>Math.abs(dy)||canScroll(touch.target,dy))return;event.preventDefault();if(!touch.handled&&Math.abs(dy)>40){touch.handled=true;if(!animating)go(current+Math.sign(dy));}}
    function scroll(){cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(function(){if(animating)return;var closest=0,distance=Infinity;pages.forEach(function(_,i){var d=Math.abs(top(i)-viewport.scrollTop);if(d<distance){distance=d;closest=i;}});current=closest;update();});}
    viewport.addEventListener('wheel',wheel,{passive:false});viewport.addEventListener('keydown',key);viewport.addEventListener('touchstart',touchStart,{passive:true});viewport.addEventListener('touchmove',touchMove,{passive:false});viewport.addEventListener('scroll',scroll,{passive:true});
    var resize=new ResizeObserver(function(){if(!animating)viewport.scrollTop=top(current);});resize.observe(viewport);update();
    cleanups.push(function(){cancelAnimationFrame(frame);cancelAnimationFrame(scrollFrame);resize.disconnect();viewport.removeEventListener('wheel',wheel);viewport.removeEventListener('keydown',key);viewport.removeEventListener('touchstart',touchStart);viewport.removeEventListener('touchmove',touchMove);viewport.removeEventListener('scroll',scroll);});
  }};
})(window);
