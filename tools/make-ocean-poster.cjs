const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('@playwright/test');
const { createServer } = require('./serve.cjs');
(async () => {
  const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage(); await page.goto('http://127.0.0.1:' + server.address().port + '/preview.html');
    const images = await page.evaluate(async () => {
      const video = document.createElement('video'); video.muted = true; video.src = 'assets/web/ocean.webm';
      await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject; });
      video.currentTime = 1; await new Promise(resolve => { video.onseeked = resolve; });
      return [640, 1600].map(width => {
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = Math.round(width * video.videoHeight / video.videoWidth);
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); return canvas.toDataURL('image/webp', .8).split(',')[1];
      });
    });
    images.forEach((data, i) => fs.writeFileSync(path.resolve(__dirname, '../assets/web/ocean-' + (i ? 'poster' : 'thumb') + '.webp'), Buffer.from(data, 'base64')));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
