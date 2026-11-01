const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../Guns_Lol_Examples');
for (const d of fs.readdirSync(root)) {
  for (const f of fs.readdirSync(path.join(root, d))) {
    if (!/\.html?$/.test(f)) continue;
    const s = fs.readFileSync(path.join(root, d, f), 'utf8');
    console.log('\nFILE', d, f, 'bytes', s.length);
    console.log(s.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 14000));
    console.log('CSS VARS', [...new Set(s.match(/--[\w-]+:[^;"}]+/g))].slice(0, 100));
    console.log('MEDIA', [...new Set(s.match(/(?:src|poster)="[^"]+"/g))].filter(x => !x.includes('download')).slice(0, 50));
  }
}
