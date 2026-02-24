// Simple Node.js server with SPA routing support
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Check if file exists
  fs.readFile(filePath, (error, content) => {
    if (error) {
      // Only serve index.html for SPA routes (not for actual files with extensions)
      // Static files (.js, .css, .png, etc.) should return 404 if not found
      const hasExtension = extname && extname !== '';
      const isSPARoute = !hasExtension && 
                        (req.url.startsWith('/blogs/') || 
                         req.url.startsWith('/tools/') ||
                         req.url === '/' ||
                         (req.url.length > 1 && !req.url.includes('.')));
      
      if (error.code === 'ENOENT' && isSPARoute) {
        console.log(`SPA route not found, serving index.html for: ${req.url}`);
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // File not found - return 404
        console.log(`File not found: ${req.url} (extname: ${extname})`);
        res.writeHead(404);
        res.end(`File not found: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('SPA routing enabled - all routes will fall back to index.html');
});

