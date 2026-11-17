// Serves the built app at http://localhost:8090 so you can try it without Apps Script.
// Part files are fetched from /chunks/<name>.html instead of google.script.run.
const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'apps-script');
const port = +process.env.PORT || 8090;
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = null, type = 'text/html; charset=utf-8';
  if (url === '/' || url === '/index.html') file = 'CadStudioPage.html';
  else { const m = url.match(/^\/chunks\/(CadParts\d{2})\.html$/); if (m) { file = m[1] + '.html'; type = 'application/json'; } }
  if (!file || !fs.existsSync(path.join(dir, file))) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  fs.createReadStream(path.join(dir, file)).pipe(res);
}).listen(port, () => console.log(`VEX IQ CAD Studio preview: http://localhost:${port}`));
