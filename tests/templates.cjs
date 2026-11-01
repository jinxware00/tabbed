const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');
const { createServer } = require('../tools/serve.cjs');
(async () => {
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
    function observe(p){p.on('pageerror',error=>errors.push(error.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});}context.on('page',observe);observe(page);
    await page.goto(base+'/editor/');await page.waitForFunction(()=>window.Editor?.State.Config);
    const nav=name=>page.getByRole('navigation',{name:'Dashboard'}).getByRole('button',{name,exact:true}).click();
    await expect(page.getByLabel('Profile layout',{exact:true}).locator('option')).toHaveText(['Centered','Split','Fullscreen']);
    const before=await page.evaluate(()=>{var c=Editor.State.Config;c.Profile.DisplayName='Skylark';c.Profile.UserName='skylark';c.Profile.Bio='My own introduction';c.Profile.Badges=[{Icon:'heart',Label:'Mine'}];c.Music.Title='My track';c.Music.Enabled=true;c.Music.Src='assets/web/avatar.webp';return structuredClone(ProfileRuntime.ValidateConfig(c).Config);});
    await nav('Templates');
    const gallery=page.locator('.template-grid');await expect(gallery.locator('.template-card')).toHaveCount(6);
    await expect(gallery).not.toContainText('Creating little things. Collecting good moments.');
    for(const label of ['Creator','Good energy','Music lover'])await expect(gallery.getByText(label,{exact:true})).toHaveCount(0);
    await page.getByRole('button',{name:'Use Alpine',exact:true}).click();
    let dialog=page.locator('.template-copy-dialog[open]');await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('checkbox',{name:'Links',exact:true})).not.toBeChecked();
    await dialog.getByRole('button',{name:'Clear selection',exact:true}).click();await expect(dialog.getByRole('button',{name:'Apply selected'})).toBeDisabled();
    await dialog.getByRole('checkbox',{name:'Wallpaper',exact:true}).check();await dialog.getByRole('button',{name:'Apply selected'}).click();
    const after=await page.evaluate(()=>structuredClone(Editor.State.Config));assert.match(after.Background.Image,/alpine.webp$/);
    for(const key of ['Profile','Social','Music','Widgets','Portfolio','Layout','Theme','Effects'])assert.deepEqual(after[key],before[key],key+' preserved when copying only wallpaper');
    await nav('Templates');await page.getByRole('button',{name:'Use Northern Lights',exact:true}).click();dialog=page.locator('.template-copy-dialog[open]');await dialog.getByRole('button',{name:'Select all',exact:true}).click();await dialog.getByRole('button',{name:'Apply selected'}).click();
    const all=await page.evaluate(()=>structuredClone(Editor.State.Config));assert.equal(all.Profile.DisplayName,'Skylark');assert.equal(all.Profile.UserName,'skylark');assert.equal(all.Profile.Avatar,before.Profile.Avatar);assert.ok(all.Profile.Badges.length>=3);assert.ok(all.Social.Links.length>=3);assert.equal(all.Layout.Preset,'portfolio');assert.equal(all.Music.Enabled,false);
    await nav('Templates');await page.getByRole('button',{name:'Use Coastline',exact:true}).click();await page.locator('.template-copy-dialog[open]').getByRole('button',{name:'Close',exact:true}).click();assert.deepEqual(await page.evaluate(()=>structuredClone(Editor.State.Config)),all);
    await nav('Links');await expect(page.locator('#card-badges')).toBeVisible();await nav('Customize');await expect(page.locator('#card-badges')).toBeHidden();
    console.log('PASS Three clear layout choices, selective copying, cancellation, preserved identity, and badges in Links');
    const asset=page.locator('.dashboard-page:not([hidden]) .asset-tile').first();
    for(const name of ['Use URL','Search','Remove Background']){const button=asset.getByRole('button',{name,exact:true});await expect(button.locator('svg')).toHaveCount(1);assert.equal(await button.evaluate(n=>!!n.closest('.asset-box')),true);await expect(button).toHaveAttribute('title',name);}
    await asset.getByRole('button',{name:'Use URL',exact:true}).click();await page.getByRole('textbox',{name:'Background URL',exact:true}).fill('assets/web/tokyo.webp');await page.getByRole('button',{name:'Apply',exact:true}).click();await expect(asset.locator('.asset-visual')).toHaveAttribute('data-value','assets/web/tokyo.webp');
    await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/assets-icons.png'),fullPage:true});
    await nav('Templates');await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/templates-lively.png'),fullPage:true});await page.getByRole('button',{name:'Use Alpine',exact:true}).click();await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/template-copy.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/template-copy-mobile.png'),fullPage:true});
    console.log('PASS Asset icon actions work inside their boxes; copy menu fits mobile');
    await page.setViewportSize({width:1440,height:1000});
    for(const id of ['tokyo','alpine','aurora','coast','sakura','forest']){
      await page.goto(base+'/profile.html?template='+id);const entry=page.getByRole('button',{name:'Enter profile',exact:true});await expect(entry).toBeVisible();assert.equal(await entry.evaluate(n=>getComputedStyle(n).opacity),'1');await expect(entry).toContainText('click to enter');
      if(id==='tokyo')await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/template-entry.png')});
      await entry.press('Enter');await expect(entry).toHaveCount(0);await expect(page.locator('[data-profile-role=bio]')).toBeVisible();assert.ok(await page.locator('[data-profile-role=badge]').count()>=3);assert.ok(await page.locator('[data-profile-role=links] a').count()>=3);
    }
    console.log('PASS All six previews show a working entry screen, your identity, starter descriptions, badges, and links');
    for(const [id,layout] of [['tokyo','guns'],['alpine','modern'],['aurora','portfolio']]){
      await page.goto(base+'/profile.html?template='+id+'&noentry=1');await expect(page.locator('.ref-stage[data-layout='+layout+']')).toBeVisible();
      const viewport=page.locator('.ref-scroll'),dots=page.getByRole('navigation',{name:'Profile sections'});
      await expect(dots.getByRole('button')).toHaveCount(3);
      await page.waitForTimeout(1100);await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/'+layout+'-profile.png')});
      await page.mouse.move(550,450);await page.mouse.wheel(0,120);await page.waitForTimeout(260);
      const mid=await viewport.evaluate(el=>el.scrollTop);assert.ok(mid>0&&mid<1000,'Animated movement before arrival: '+mid);
      await expect.poll(()=>viewport.evaluate(el=>Math.round(el.scrollTop))).toBe(1000);
      await expect(dots.getByRole('button',{name:'About',exact:true})).toHaveAttribute('aria-current','true');
      await page.waitForTimeout(1200);await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/'+layout+'-about.png')});
      await dots.getByRole('button',{name:'Profile',exact:true}).click();await expect.poll(()=>viewport.evaluate(el=>Math.round(el.scrollTop))).toBe(0);
      await page.mouse.move(550,450);
      for(let i=0;i<28;i++){await page.mouse.wheel(0,50);await page.waitForTimeout(25);}
      await page.waitForTimeout(300);assert.equal(Math.round(await viewport.evaluate(el=>el.scrollTop)),1000,'One momentum gesture advances one dot');
      await viewport.focus();await page.keyboard.press('PageDown');await expect.poll(()=>viewport.evaluate(el=>Math.round(el.scrollTop))).toBe(2000);await expect(dots.getByRole('button',{name:'Widgets',exact:true})).toHaveAttribute('aria-current','true');
      await page.waitForTimeout(1100);await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/'+layout+'-widgets.png')});
      await page.setViewportSize({width:390,height:844});await expect.poll(()=>viewport.evaluate(el=>Math.round(el.scrollTop))).toBe(1688);assert.ok(await viewport.evaluate(el=>el.scrollWidth<=el.clientWidth));await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/'+layout+'-widgets-mobile.png')});
      await dots.getByRole('button',{name:'Profile',exact:true}).click();await expect.poll(()=>viewport.evaluate(el=>Math.round(el.scrollTop))).toBe(0);await page.waitForTimeout(1100);await page.screenshot({path:path.resolve(__dirname,'../.test-artifacts/'+layout+'-profile-mobile.png')});
      await viewport.evaluate(el=>{for(const [type,y] of [['touchstart',600],['touchmove',400]])el.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:[new Touch({identifier:1,target:el,clientX:150,clientY:y})]}));});await expect.poll(()=>viewport.evaluate(el=>Math.round(el.scrollTop))).toBe(844);
      await page.setViewportSize({width:1440,height:1000});
    }
    console.log('PASS All three layouts support animated wheel, momentum, keyboard, touch, widgets, and viewport resizing');
    const wav=Buffer.alloc(16044);wav.write('RIFF');wav.writeUInt32LE(16036,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
    for(const layout of ['guns','modern','portfolio']){
      await page.evaluate(async ({layout,audio})=>{await LayoutLoader.Load(layout);var c=structuredClone(PROFILE_CONFIG);c.Layout.Preset=layout;c.Widgets.Discord.Enabled=true;c.Widgets.Discord.Name='Our space';c.Portfolio.LastFm.Enabled=true;c.Widgets.Quote.Enabled=true;c.Widgets.Quote.Text='Make something worth sharing.';c.Portfolio.Projects=[{Section:0,Title:'My project',Description:'A small experiment.',Url:'https://github.com/',Image:'assets/web/alpine.webp',Icon:'github',Service:'github'}];c.Music.Enabled=true;c.Music.Src=audio;c.Music.Title='A quiet moment';c.Portfolio.AboutDetails=Array(40).fill('An interest, a story, and a little more detail.').join('\n');PROFILE_CONFIG=c;ProfileRuntime.AutoMount();},{layout,audio:'data:audio/wav;base64,'+wav.toString('base64')});
      const dots=page.getByRole('navigation',{name:'Profile sections'}),viewport=page.locator('.ref-scroll');await expect(dots.getByRole('button')).toHaveCount(6);
      await dots.getByRole('button',{name:'Widgets',exact:true}).click();await expect(page.locator('.ref-shared-widgets .ref-widget-item')).toHaveCount(3);await expect(page.getByText('Our space',{exact:true})).toBeVisible();
      await dots.getByRole('button',{name:'Music',exact:true}).click();await expect(page.locator('[data-profile-role=music]')).toBeVisible();await page.getByRole('button',{name:'Play music',exact:true}).click();await expect(page.getByRole('button',{name:'Pause music',exact:true})).toBeVisible();
      await dots.getByRole('button',{name:'Quote',exact:true}).click();await expect(page.getByText('Make something worth sharing.',{exact:true})).toBeVisible();
      await dots.getByRole('button',{name:'About',exact:true}).click();await expect.poll(()=>viewport.evaluate(el=>Math.round(el.scrollTop))).toBe(1000);const body=page.locator('[data-section-label=About] .ref-page-body');await body.hover();await page.mouse.wheel(0,120);await expect.poll(()=>body.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);assert.equal(await viewport.getAttribute('data-active-section'),'1','Long content scrolls inside its current section');
      await page.emulateMedia({reducedMotion:'reduce'});await dots.getByRole('button',{name:'Widgets',exact:true}).click();assert.equal(await viewport.evaluate(el=>Math.round(el.scrollTop)),2000);await page.emulateMedia({reducedMotion:'no-preference'});
    }
    console.log('PASS Every layout renders community, clock, Last.fm, projects, music, quote, and long content; reduced motion keeps paging usable');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
