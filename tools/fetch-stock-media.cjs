const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets', 'web'); fs.mkdirSync(out, { recursive: true });
const photos = [
  ['tokyo', '1513407030348-c983a97b98d8', 'Tokyo at night'],
  ['alpine', '1464822759023-fed622ff2c3b', 'Mountain peaks'],
  ['aurora', '1531366936337-7c912a4589a7', 'Northern lights'],
  ['coast', '1500375592092-40eb2168fd21', 'Ocean waves'],
  ['sakura', '1490750967868-88aa4486c946', 'Spring blossoms'],
  ['forest', '1448375240586-882707db888b', 'Forest canopy'],
  ['avatar', '1573865526739-10659fec78a5', 'Cat portrait']
];
async function download(url, file) {
  if (fs.existsSync(file)) return;
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(r.status + ' ' + url);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}
(async () => {
  const credits = [];
  for (const [id, photo, title] of photos) {
    const source = 'https://images.unsplash.com/photo-' + photo;
    await download(source + '?auto=format&fit=crop&w=' + (id === 'avatar' ? 320 : 1920) + '&q=78&fm=webp', path.join(out, id + '.webp'));
    if (id !== 'avatar') await download(source + '?auto=format&fit=crop&w=640&q=65&fm=webp', path.join(out, id + '-thumb.webp'));
    credits.push({ id, title, source, license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license' });
    console.log('Saved ' + id);
  }
  const source = 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Ocean_in_Sommaroy.webm';
  await download(source, path.join(out, 'ocean.webm'));
  credits.push({ id: 'ocean', author:'Netha Hussain', title: 'Ocean in Sommaroy', source: 'https://commons.wikimedia.org/wiki/File:Ocean_in_Sommaroy.webm', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' });
  fs.writeFileSync(path.join(out, 'credits.json'), JSON.stringify(credits, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
