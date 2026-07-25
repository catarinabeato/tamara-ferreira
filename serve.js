#!/usr/bin/env node
'use strict';

/*
 * Servidor local para pré-visualizar o site depois de `npm run build`.
 * Sem dependências.
 *
 *   npm start        (constrói e serve)
 *   npm run serve    (apenas serve o que já está em dist/)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT) || 4321;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

if (!fs.existsSync(ROOT)) {
  console.error('dist/ não existe. Corra primeiro: npm run build');
  process.exit(1);
}

http
  .createServer((req, res) => {
    const requested = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(ROOT, requested);

    /* Impede sair da pasta dist/. */
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>Página não encontrada.</p>');
      return;
    }

    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`Pré-visualização em http://localhost:${PORT}/`);
  });
