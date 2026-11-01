const { chromium } = require('@playwright/test');
const { createServer } = require('./serve.cjs');
const path = require('node:path');
(async () => {
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/editor/`);
    await page.waitForFunction(() => window.Editor?.State.Config && document.querySelector('.asset-visual'));
    await page.screenshot({ path: path.resolve(__dirname, '../.test-artifacts/dashboard-desktop.png'), fullPage: true });
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.resolve(__dirname, '../.test-artifacts/preview-desktop.png') });
    console.log(JSON.stringify({ errors, heading: await page.title(), pages: await page.locator('.dashboard-page').count() }));
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
