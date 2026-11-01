const fs = require('node:fs');
const path = require('node:path');
function readFlight(html) {
  let stream = '';
  for (const m of html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)/g)) {
    try { const item = JSON.parse(m[1]); if (item[0] === 1) stream += item[1]; } catch (_) {}
  }
  const records = {};
  let bytes = Buffer.from(stream), pos = 0;
  while (pos < bytes.length) {
    const colon = bytes.indexOf(58, pos); if (colon < 0) break;
    const key = bytes.toString('utf8', pos, colon); pos = colon + 1;
    if (bytes[pos] === 84) {
      const comma = bytes.indexOf(44, pos);
      const size = parseInt(bytes.toString('utf8', pos + 1, comma), 16);
      if (!Number.isFinite(size)) break;
      records[key] = bytes.toString('utf8', comma + 1, comma + 1 + size); pos = comma + 1 + size;
    } else {
      let end = bytes.indexOf(10, pos); if (end < 0) end = bytes.length;
      const value = bytes.toString('utf8', pos, end);
      try { records[key] = JSON.parse(value); } catch (_) {}
      pos = end + 1;
    }
  }
  return records;
}
module.exports = { readFlight };
if (require.main === module) {
  for (const dir of ['Example 1', 'Example 2', 'Example 3']) {
    const folder = path.resolve(__dirname, '../../Guns_Lol_Examples', dir);
    const file = fs.readdirSync(folder).find(f => /\.html?$/.test(f));
    const records = readFlight(fs.readFileSync(path.join(folder, file), 'utf8'));
    const found = [];
    function walk(value, key = '') {
      if (!value || typeof value !== 'object') return;
      if (value.synced_lyrics) found.push({ key, lyrics: value.synced_lyrics, title: value.track_title, sample: records[value.synced_lyrics.slice(1)]?.slice(0, 200) });
      if (value.typewriter_enabled !== undefined) console.log(dir, 'config keys', Object.keys(value));
      if (value.custom_font) console.log(dir, 'font', value.custom_font);
      for (const [k, v] of Object.entries(value)) walk(v, key + '.' + k);
    }
    walk(records); console.log(dir, 'lyrics', found);
    fs.writeFileSync(path.resolve(__dirname, '../.test-artifacts', dir.replaceAll(' ', '-') + '-flight.json'), JSON.stringify(records, null, 2));
  }
}
