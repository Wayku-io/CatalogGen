const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const ROOT_DIR = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
  };

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3456'}`);
  const pathname = urlObj.pathname;

  if (pathname === '/manifest.json') {
    const manifestPath = path.join(ROOT_DIR, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return fs.createReadStream(manifestPath).pipe(res);
    }
    const manifestHandler = require('../api/manifest.js');
    return manifestHandler(req, res);
  }

  if (pathname.startsWith('/catalog/')) {
    const cleanPath = pathname.replace(/^\/catalog\//, '').replace(/\.json$/, '');
    const parts = cleanPath.split('/');
    const type = parts[0];
    const id = parts[1];
    const extra = parts.slice(2).join('/');

    req.query = Object.fromEntries(urlObj.searchParams.entries());
    req.query.type = type;
    req.query.id = id;
    if (extra) req.query.extra = extra;

    const catalogHandler = require('../api/catalog.js');
    return catalogHandler(req, res);
  }

  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
