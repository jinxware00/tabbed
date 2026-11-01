// Keep layout structure and generic SVG artwork; discard every captured user's content.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '..'), source = path.resolve(root, '../Guns_Lol_Examples');
const layouts = require('./reference-profiles.cjs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage(), sheets = new Map(), icons = {};
    const output = path.join(root, 'js/templates'); fs.mkdirSync(output, { recursive: true });
    for (const [id, directory] of layouts.concat([['dashboard', 'Dashboard Example']])) {
      const folder = path.join(source, directory), file = fs.readdirSync(folder).find(f => /\.html?$/.test(f));
      const html = fs.readFileSync(path.join(folder, file), 'utf8');
      const result = await page.evaluate(({ html, id }) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const css = [...doc.querySelectorAll('link[rel=stylesheet]')].map(n => n.getAttribute('href'));
        doc.querySelectorAll('script,iframe,style,link,template,input[type=hidden],.cf-turnstile').forEach(n => n.remove());
        const q = (key, within = doc) => within.querySelector('[class*="' + key + '"]');
        const named = {}, list = [];
        function icon(el, label) {
          const clone = el.cloneNode(true); clone.querySelectorAll('image,text,title,desc').forEach(n => n.remove());
          clone.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => { if (a.name === 'style' || /href|^on/i.test(a.name)) n.removeAttribute(a.name); }));
          return { t: label, viewBox: el.getAttribute('viewBox') || '0 0 24 24', body: clone.innerHTML, attrs: { fill: el.getAttribute('fill'), stroke: el.getAttribute('stroke') } };
        }
        [...doc.querySelectorAll('svg')].forEach((el, i) => list.push(icon(el, 'Icon ' + (i + 1))));
        const controls = q('GUNS__91-5d3a15c3');
        if (controls) ['skip-prev', 'pause', 'skip-next'].forEach((key, i) => { const svg = controls.children[i]?.querySelector('svg'); if (svg) named[key] = icon(svg, key); });
        if (id === 'guns') ['github', 'youtube', 'discord', 'roblox', 'namemc', 'reddit', 'spotify'].forEach((key, i) => { const svg = q('GUNS__d7-fb8c6083')?.children[i]?.querySelector('svg'); if (svg) named[key] = icon(svg, key); });
        if (id === 'dashboard') return { css: [], list, named };
        const container = doc.querySelector('[style*="--presenceUsernameColor"]');
        const entry = q('GUNS__43-018c3d03'), overlay = q('GUNS__77-70062015');
        function clean(root) {
          if (!root) return '';
          root.querySelectorAll('[alt="Discord Badge"],[alt="Guild Tag Icon"],svg text,svg title,svg desc,svg image').forEach(n=>n.remove());
          // Preserve the shape of text/image containers for the new local bindings.
          const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT); const texts = [];
          while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('svg')) texts.push(walker.currentNode);
          texts.forEach(n => { n.textContent = ''; });
          for (const el of [root, ...root.querySelectorAll('*')]) {
            for (const a of [...el.attributes]) {
              if (/^(src|srcset|href|poster|title|id|aria-label)$/i.test(a.name) || /^on/i.test(a.name) || a.name.startsWith('data-c') || a.name === 'false') el.removeAttribute(a.name);
              if (a.name === 'alt') el.setAttribute('alt', /Discord Avatar|Last.fm Avatar/.test(a.value) ? a.value : '');
              if (a.name === 'class') el.setAttribute('class', a.value.replaceAll('GUNS__', 'tb-'));
            }
            for (const property of [...el.style]) if (/url\(|cursor|font-family/i.test(property + ':' + el.style.getPropertyValue(property))) el.style.removeProperty(property);
            if (el.localName === 'a') el.setAttribute('rel', 'noopener noreferrer');
          }
          // Old lyric lines and nested captured clan/badge images carry no reusable content.
          root.querySelectorAll('[alt="Discord Badge"],[alt="Guild Tag Icon"]').forEach(n => n.remove());
          return root.outerHTML;
        }
        return { html: clean(container), entry: clean(entry), overlay: clean(overlay), css, list, named };
      }, { html, id });
      for (const icon of result.list) { const key = 'ref-' + crypto.createHash('sha256').update(icon.viewBox + icon.body).digest('hex').slice(0, 12); icons[key] ||= icon; }
      Object.assign(icons, result.named);
      if (id === 'dashboard') continue;
      fs.writeFileSync(path.join(output, id + '.json'), JSON.stringify({ html: result.html, entry: result.entry, overlay: result.overlay, kind: ['guns', 'modern'].includes(id) ? id : 'portfolio' }));
      for (const cssPath of result.css) {
        const file = path.resolve(folder, cssPath || '');
        if (!file.startsWith(folder + path.sep) || !fs.existsSync(file) || !file.endsWith('.css')) continue;
        let css = fs.readFileSync(file, 'utf8'); if (css.includes('@font-face')) continue;
        css = css.replaceAll('GUNS__', 'tb-').replace(/url\([^)]*\)/g, 'none');
        sheets.set(crypto.createHash('sha256').update(css).digest('hex'), css);
      }
    }
    const font = fs.readFileSync(path.join(root, 'assets/reference/satoshi.woff2')).toString('base64');
    fs.writeFileSync(path.join(root, 'css/reference.css'), [...sheets.values()].join('\n') + '\n@font-face{font-family:Satoshi;src:url(data:font/woff2;base64,' + font + ') format("woff2");font-weight:300 900;font-display:swap}\n');
    // Service artwork stays selectable without private custom image icons.
    icons.osu = { t: 'osu!', viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4"/>' };
    icons.tracker = { t: 'Tracker', viewBox: '0 0 24 24', body: '<path d="M10 2h4v4h4v4h4v4h-4v4h-4v4h-4v-4H6v-4H2v-4h4V6h4zm0 8v4h4v-4z"/>' };
    fs.writeFileSync(path.join(root, 'js/reference-icons.js'), 'Object.assign(ICONS,' + JSON.stringify(icons) + ');\n');
    console.log('Built six content-free layout files; original identities, text, images, audio and links excluded.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
