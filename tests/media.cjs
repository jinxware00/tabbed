const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,expect}=require('@playwright/test');
const {createServer}=require('../tools/serve.cjs');
(async()=>{
  const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
    await page.goto(base+'/editor/');await page.waitForFunction(()=>window.Editor?.State.Config);
    assert.ok(!requests.some(u=>u.includes('/js/templates/')),'Layouts are not loaded until preview');
    assert.ok(fs.statSync(path.resolve(__dirname,'../editor/sources.js')).size<2000,'Small export loader');
    assert.ok(!requests.some(u=>/reference-(settings|data)/.test(u)),'No retired eager sources');
    const active=()=>page.locator('.dashboard-page:not([hidden])');
    const nav=name=>page.getByRole('navigation',{name:'Dashboard'}).getByRole('button',{name,exact:true}).click();
    await nav('Account');await active().getByLabel('Username',{exact:true}).fill('skylark');await active().getByLabel('Display name',{exact:true}).fill('');
    await nav('Templates');await expect(page.locator('.template-display-name')).toHaveText(Array(6).fill('skylark'));
    const thumbnails=await page.locator('.template-wallpaper').evaluateAll(images=>images.map(i=>({src:i.src,loading:i.loading})));
    assert.ok(thumbnails.every(i=>i.src.includes('-thumb.webp')&&i.loading==='lazy'));assert.ok(thumbnails[3].src.includes('ocean-thumb'));
    const popupReady=page.waitForEvent('popup');await page.getByRole('button',{name:'Preview Tokyo Nights',exact:true}).click();const popup=await popupReady;
    await expect(popup.getByRole('button',{name:'Enter profile',exact:true})).toBeVisible();await popup.getByRole('button',{name:'Enter profile',exact:true}).click();
    await expect(popup.locator('.pf-name-text')).toHaveText('skylark');await expect(popup.locator('[data-profile-role=avatar]')).toHaveAttribute('src','assets/web/avatar.webp');await popup.close();
    await page.getByRole('button',{name:'Use Alpine',exact:true}).click();await page.getByRole('button',{name:'Apply selected',exact:true}).click();assert.equal(await page.evaluate(()=>Editor.State.Config.Profile.UserName),'skylark');
    console.log('PASS Lazy export/layout loading, actual wallpaper cards, and identity in template previews');

    const image=fs.readFileSync(path.resolve(__dirname,'../assets/web/avatar.webp'));
    let mediaRequests=0;
    await page.route('https://upload.wikimedia.org/**',async route=>{mediaRequests++;await route.fulfill({contentType:'image/webp',body:image,headers:{'access-control-allow-origin':'*'}});});
    await page.route('https://commons.wikimedia.org/w/api.php?*',async route=>{
      const params=new URL(route.request().url()).searchParams,q=params.get('gsrsearch');
      if(q.startsWith('failure')){await route.fulfill({status:503,headers:{'access-control-allow-origin':'*'},body:'Unavailable'});return;}
      if(q.startsWith('slow'))await new Promise(r=>setTimeout(r,700));
      const gif=q.includes('filemime:gif'),audio=q.includes('filetype:audio'),offset=Number(params.get('gsroffset'));
      const title=audio?'Rain sound.wav':gif?'Cat animation.gif':(offset?'More wallpaper.webp':'Mountain wallpaper.webp');
      const data={query:{pages:{1:{index:0,title:'File:'+title,imageinfo:[{url:'https://upload.wikimedia.org/test/'+encodeURIComponent(title),mime:audio?'audio/wav':gif?'image/gif':'image/webp',size:32796,descriptionurl:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(title),extmetadata:{Artist:{value:'<b>Example artist</b>'},LicenseShortName:{value:'CC0'}}}]}}}};
      if(!offset)data.continue={gsroffset:12};
      await route.fulfill({json:data,headers:{'access-control-allow-origin':'*'}});
    });
    await nav('Assets');const background=active().locator('.asset-tile').filter({has:page.getByRole('heading',{name:'Background',exact:true})});
    await background.getByRole('button',{name:'Search',exact:true}).click();let modal=page.locator('.media-dialog[open]');
    await modal.getByRole('searchbox',{name:'Search media'}).fill('mountains');await expect(modal.locator('.media-result h4')).toHaveText(['Mountain wallpaper.webp']);
    assert.equal(mediaRequests,0,'Search does not preload full media');await modal.getByRole('button',{name:'Load more',exact:true}).click();await expect(modal.locator('.media-result')).toHaveCount(2);
    await modal.getByRole('button',{name:'Use Mountain wallpaper.webp',exact:true}).click();await expect(modal).toHaveCount(0);
    await expect(background.locator('.asset-visual')).toHaveAttribute('data-value',/^blob:/);await expect(page.locator('#save-status')).toHaveText('Saved locally');
    assert.equal(await page.evaluate(()=>Editor.State.Config.MediaCredits[0].author),'Example artist');
    const portable=await page.evaluate(()=>ProfileStore.portable(Editor.State.Config));assert.match(portable.Background.Image,/^data:image\/webp/);assert.ok(!JSON.stringify(portable).includes('blob:'));
    await page.reload();await page.waitForFunction(()=>window.Editor?.State.Config);assert.ok(await page.evaluate(()=>Editor.State.Config.Background.Image.startsWith('blob:')));
    console.log('PASS Media search, pagination, attribution, blob persistence, and portable JSON');

    await background.getByRole('button',{name:'Search',exact:true}).click();modal=page.locator('.media-dialog[open]');
    await modal.getByRole('button',{name:'GIFs',exact:true}).click();await modal.getByRole('searchbox').fill('cat');await expect(modal.locator('.media-result h4')).toHaveText(['Cat animation.gif']);
    const before=mediaRequests;await page.waitForTimeout(250);assert.equal(mediaRequests,before,'GIF search does not play animations');
    await modal.getByRole('button',{name:'Preview Cat animation.gif',exact:true}).click();await expect(modal.locator('.media-detail img')).toBeVisible();
    await modal.getByRole('button',{name:'Close preview',exact:true}).click();await expect(modal.locator('.media-detail img')).toHaveCount(0);
    await modal.getByRole('searchbox').fill('failure');await expect(modal.locator('.media-status')).toContainText('unavailable');
    await modal.getByRole('searchbox').fill('slow');await page.waitForTimeout(380);await modal.getByRole('searchbox').fill('cat');await expect(modal.locator('.media-result h4')).toHaveText(['Cat animation.gif']);
    await modal.getByRole('button',{name:'Close',exact:true}).click();
    const audio=active().locator('.asset-tile').filter({has:page.getByRole('heading',{name:'Audio',exact:true})});await audio.getByRole('button',{name:'Search',exact:true}).click();modal=page.locator('.media-dialog[open]');
    await modal.getByRole('searchbox').fill('rain ambient');await expect(modal.locator('.media-result h4')).toHaveText(['Rain sound.wav']);
    await expect(modal.locator('audio')).toHaveCount(0);await modal.getByRole('button',{name:'Close',exact:true}).click();
    console.log('PASS GIF/audio search without autoplay, explicit previews, errors, and cancelled searches');

    const cleaned=await page.evaluate(()=>CleanLegacyDraft({Profile:{UserName:'jinxware00',DisplayName:'jinxware00',Avatar:'assets/avatar.svg',Bio:'this is my description',Location:'My own city'},Layout:{Preset:'guns'},Music:{Enabled:true,Src:'assets/examples/jinx-audio.mp3',Title:'bunii',Tracks:[]},Background:{Type:'video',Video:'assets/examples/jinx-background.mp4'},Effects:{EntryScreen:{Text:'click to enter...'}}}));
    assert.equal(cleaned.Profile.UserName,'yourname');assert.equal(cleaned.Profile.Bio,'Creating little things. Collecting good moments.');assert.equal(cleaned.Profile.Location,'My own city');assert.equal(cleaned.Music.Enabled,false);assert.match(cleaned.Profile.Avatar,/assets\/web\//);
    assert.ok(!JSON.stringify(cleaned).includes('assets/examples/'));assert.equal(cleaned.Background.Type,'image');
    await page.setViewportSize({width:390,height:844});await background.getByRole('button',{name:'Search',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);console.log('PASS Legacy draft cleanup preserves edits; media picker fits mobile');
  }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
