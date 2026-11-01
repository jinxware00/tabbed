const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('**/*', route => /\.download(?:$|\?)/.test(route.request().url()) || /^https?:/.test(route.request().url()) ? route.abort() : route.continue());
  const out = path.resolve(__dirname, '../.test-artifacts'); fs.mkdirSync(out,{recursive:true});
  const root = path.resolve(__dirname, '../../Guns_Lol_Examples');
  for (const d of fs.readdirSync(root)) {
    const f = fs.readdirSync(path.join(root,d)).find(x => /\.html?$/.test(x));
    const page = await context.newPage();
    await page.goto(pathToFileURL(path.join(root,d,f)).href);
    await page.waitForTimeout(500);
    if (d !== 'Dashboard Example') {
      await page.evaluate(() => {
        document.querySelectorAll('body *').forEach(el => {const s = getComputedStyle(el); if(s.position === 'fixed' && +s.zIndex > 100 && !el.querySelector('h1')) el.remove();});
      });
    }
    await page.screenshot({path:path.join(out,d+'.png'),fullPage:true});
    console.log(d, await page.evaluate(() => ({images:[...document.images].map(x=>({src:x.getAttribute('src'),alt:x.alt,width:x.width,height:x.height})), fields:[...document.querySelectorAll('input,textarea,select')].map(x=>({type:x.type,value:x.value,placeholder:x.placeholder})), headlines:[...document.querySelectorAll('h1,h2,h3')].map(x=>({text:x.textContent,cls:x.className}))})));
    await page.close();
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
