const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.webm':'video/webm', '.wav':'audio/wav', '.ogg':'audio/ogg', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
function createServer(directory = root) {
  return http.createServer((req, res) => {
    let filename;
    try { filename = path.resolve(directory, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); } catch { res.writeHead(400).end(); return; }
    if (filename !== directory && !filename.startsWith(directory + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(filename) && fs.statSync(filename).isDirectory()) filename = path.join(filename, 'index.html');
    fs.stat(filename, (error, stat) => {
      if (error || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
      const headers = { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
      let start = 0, end = stat.size - 1;
      if (match) {
        start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end;
        if (start > end) { res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size }).end(); return; }
        headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      }
      headers['Content-Length'] = end - start + 1;
      res.writeHead(match ? 206 : 200, headers);
      if (req.method === 'HEAD') res.end(); else fs.createReadStream(filename, { start, end }).pipe(res);
    });
  });
}
module.exports = { createServer };
if (require.main === module) {
  const port = Number(process.env.PORT) || 8766;
  createServer().listen(port, '127.0.0.1', () => console.log(`Dashboard: http://localhost:${port}/editor/`));
}
