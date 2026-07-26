#!/usr/bin/env node
'use strict';

/*
 * Gerador estático sem dependências.
 *
 *   node build.js
 *
 * Lê content/site.json + content/<lang>.json, aplica os modelos de src/templates
 * e escreve HTML pronto a publicar em dist/. Cada idioma tem as suas próprias
 * páginas (/pt/… e /en/…), o que mantém o conteúdo indexável pelos motores de busca.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const OUT_DIR = path.join(ROOT, 'dist');

const home = require('./src/templates/home');
const about = require('./src/templates/about');
const { blogIndex, blogPost } = require('./src/templates/blog');
const contact = require('./src/templates/contact');
const legal = require('./src/templates/legal');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const site = readJson(path.join(CONTENT_DIR, 'site.json'));
const translations = Object.fromEntries(
  site.languages.map((lang) => [lang, readJson(path.join(CONTENT_DIR, `${lang}.json`))])
);

const BASE_PATH = (site.basePath || '').replace(/\/$/, '');
const BUILD_YEAR = new Date().getFullYear();

/* ------------------------------------------------------------------ rotas */

/* Caminho público de uma página, já com basePath e barra final. */
function pagePath(lang, pageKey) {
  const segment = translations[lang].routes[pageKey];
  return `${BASE_PATH}/${lang}/${segment ? segment + '/' : ''}`;
}

function postPath(lang, slug) {
  return `${BASE_PATH}/${lang}/${translations[lang].routes.blog}/${slug}/`;
}

/*
 * O selector de idioma leva o visitante à página equivalente, não à raiz.
 * Cada página declara o seu pageId; os artigos usam "post:<id>" para que
 * slugs diferentes em PT e EN continuem a corresponder ao mesmo texto.
 */
function alternatesFor(pageId) {
  return site.languages.map((lang) => {
    let href;
    if (pageId.startsWith('post:')) {
      const postId = pageId.slice(5);
      const match = translations[lang].posts.find((post) => post.id === postId);
      href = match ? postPath(lang, match.slug) : pagePath(lang, 'blog');
    } else {
      href = pagePath(lang, pageId);
    }
    return { code: lang, label: translations[lang].langLabel, name: translations[lang].langName, href };
  });
}

/* ---------------------------------------------------------------- contexto */

function makeContext(lang, pageId, currentPath) {
  const t = translations[lang];

  return {
    lang,
    t,
    site,
    year: BUILD_YEAR,
    pageId,
    currentPath,
    languages: alternatesFor(pageId),
    posts: [...t.posts].sort((a, b) => (a.date < b.date ? 1 : -1)),
    url: (pageKey) => pagePath(lang, pageKey),
    postUrl: (post) => postPath(lang, post.slug),
    asset: (file) => `${BASE_PATH}${file}`,
    absolute: (relative) => `${site.baseUrl.replace(/\/$/, '')}${relative}`,
  };
}

/* ----------------------------------------------------------------- escrita */

function write(relativePath, contents) {
  const target = path.join(OUT_DIR, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
  return relativePath;
}

/* dist/pt/sobre-mim/index.html a partir de /pt/sobre-mim/ */
const toFile = (urlPath) => path.join(urlPath.slice(BASE_PATH.length).replace(/^\//, ''), 'index.html');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
}

/* -------------------------------------------------------------------- SEO */

function sitemap(urls) {
  const entries = urls
    .map(({ loc, alternates }) => {
      const links = alternates
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt.code}" href="${site.baseUrl.replace(/\/$/, '')}${
              alt.href
            }"/>`
        )
        .join('\n');
      return `  <url>\n    <loc>${site.baseUrl.replace(/\/$/, '')}${loc}</loc>\n${links}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

/* Raiz: escolhe o idioma do visitante e redirecciona, com ligações visíveis
   caso o JavaScript esteja desactivado. */
function rootRedirect() {
  const fallback = pagePath(site.defaultLang, 'home');
  const links = site.languages
    .map((lang) => `<a href="${pagePath(lang, 'home')}" hreflang="${lang}">${translations[lang].langName}</a>`)
    .join(' &middot; ');

  return `<!doctype html>
<html lang="${site.defaultLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${site.name}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${site.baseUrl.replace(/\/$/, '')}${fallback}">
${site.languages
  .map(
    (lang) =>
      `<link rel="alternate" hreflang="${lang}" href="${site.baseUrl.replace(/\/$/, '')}${pagePath(lang, 'home')}">`
  )
  .join('\n')}
<meta http-equiv="refresh" content="0; url=${fallback}">
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#0B0B0B;color:#FFFFFF}p{letter-spacing:.12em;text-transform:uppercase;font-size:.8rem}a{color:inherit}</style>
</head>
<body>
<p>${links}</p>
<script>
  (function () {
    var supported = ${JSON.stringify(site.languages)};
    var paths = ${JSON.stringify(Object.fromEntries(site.languages.map((l) => [l, pagePath(l, 'home')])))};
    var preferred = (navigator.languages || [navigator.language || '${site.defaultLang}'])
      .map(function (tag) { return String(tag).slice(0, 2).toLowerCase(); })
      .find(function (code) { return supported.indexOf(code) !== -1; });
    location.replace(paths[preferred] || '${fallback}');
  })();
</script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------- build */

function build() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const written = [];
  const sitemapUrls = [];

  const emit = (lang, pageId, render) => {
    const isPost = pageId.startsWith('post:');
    const urlPath = isPost
      ? postPath(
          lang,
          translations[lang].posts.find((post) => post.id === pageId.slice(5)).slug
        )
      : pagePath(lang, pageId);

    const ctx = makeContext(lang, pageId, urlPath);
    written.push(write(toFile(urlPath), render(ctx)));
    sitemapUrls.push({ loc: urlPath, alternates: ctx.languages });
  };

  for (const lang of site.languages) {
    emit(lang, 'home', home);
    emit(lang, 'about', about);
    emit(lang, 'blog', blogIndex);
    emit(lang, 'contact', contact);
    emit(lang, 'privacy', (ctx) => legal(ctx, 'privacy'));
    emit(lang, 'terms', (ctx) => legal(ctx, 'terms'));

    for (const post of translations[lang].posts) {
      emit(lang, `post:${post.id}`, (ctx) => {
        const localised = ctx.posts.find((item) => item.id === post.id);
        return blogPost(ctx, localised);
      });
    }
  }

  copyDir(ASSETS_DIR, path.join(OUT_DIR, 'assets'));

  written.push(write('index.html', rootRedirect()));
  written.push(write('sitemap.xml', sitemap(sitemapUrls)));
  written.push(
    write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl.replace(/\/$/, '')}${BASE_PATH}/sitemap.xml\n`)
  );

  console.log(`${written.length} ficheiros escritos em dist/`);
  for (const file of written.sort()) console.log(`  ${file}`);
}

build();
