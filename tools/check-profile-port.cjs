const { chromium } = require('@playwright/test');
const path = require('node:path');
const { createServer } = require('./serve.cjs');
(async () => {
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const id of ['tokyo', 'alpine', 'aurora', 'coast', 'sakura', 'forest']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/profile.html?template=${id}&noentry=1`);
      await page.waitForFunction(() => document.querySelector('.ref-stage'));
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.resolve(__dirname, '../.test-artifacts/port-' + id + '.png') });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('.ref-scroll').evaluate(el => { el.scrollTop = 0; });
      await page.screenshot({ path: path.resolve(__dirname, '../.test-artifacts/port-' + id + '-mobile.png') });
      console.log(id, JSON.stringify({ errors, links: await page.locator('[data-profile-role=links] a').count(), badges: await page.locator('[data-profile-role=badge]').count() }));
      await page.close();
    }
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
