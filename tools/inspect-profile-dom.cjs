const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const [id, dir] of [['cinematic', 'Example 1'], ['nocturne', 'Example 2'], ['panorama', 'Example 3'], ['dashboard', 'Dashboard Example']]) {
      const folder = path.resolve(root, '../Guns_Lol_Examples', dir);
      const filename = fs.readdirSync(folder).find(n => /\.html?$/.test(n));
      const html = fs.readFileSync(path.join(folder, filename), 'utf8');
      const result = await page.evaluate(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('script,style,iframe,link,opera-video-toolbar,opera-video-toolbar-popup').forEach(n => n.remove());
        function outline(n, depth = 0) {
          if (depth > 20 || n.localName === 'path') return '';
          const text = [...n.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join('').trim();
          const attrs = [...n.attributes].filter(a => !['class', 'style'].includes(a.name)).map(a => a.name + '=' + a.value).join(' ');
          const line = ' '.repeat(depth * 2) + n.localName + '.' + n.getAttribute('class') + ' ' + attrs + (text ? ' TEXT=' + text : '') + (n.getAttribute('style') ? ' STYLE=' + n.getAttribute('style') : '') + '\n';
          if (n.localName === 'svg') return line;
          return line + [...n.children].map(x => outline(x, depth + 1)).join('');
        }
        return { body: doc.body.innerHTML, outline: outline(doc.body) };
      }, html);
      fs.writeFileSync(path.join(root, '.test-artifacts', id + '-dom.html'), result.body);
      fs.writeFileSync(path.join(root, '.test-artifacts', id + '-outline.txt'), result.outline);
      console.log(id, result.outline.length);
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
