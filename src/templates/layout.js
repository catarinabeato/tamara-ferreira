'use strict';

const { esc, join } = require('../lib/html');
const { header, footer } = require('./partials');

/*
 * Apenas os cortes visíveis acima da dobra: itálico e romano do display,
 * a condensada dos kickers e o corpo de texto. Os restantes carregam
 * normalmente através de fonts.css, com font-display: swap.
 */
const PRELOAD_FONTS = [
  'playfair-display-400-italic-latin.woff2',
  'playfair-display-500-latin.woff2',
  'barlow-condensed-500-latin.woff2',
  'lora-400-latin.woff2',
];

/*
 * Estrutura HTML comum a todas as páginas: <head> com SEO, Open Graph,
 * dados estruturados, pré-carregamento de tipos de letra, cabeçalho e rodapé.
 */
function layout(ctx, { title, description, body, bodyClass = '', structuredData = [], canonicalPath }) {
  const canonical = ctx.absolute(canonicalPath !== undefined ? canonicalPath : ctx.currentPath);
  const ogImage = ctx.absolute(ctx.site.images.ogImage.src);

  const alternates = ctx.languages
    .map(
      (lang) =>
        `<link rel="alternate" hreflang="${esc(lang.code)}" href="${esc(ctx.absolute(lang.href))}">`
    )
    .concat([
      `<link rel="alternate" hreflang="x-default" href="${esc(
        ctx.absolute(ctx.languages.find((l) => l.code === ctx.site.defaultLang).href)
      )}">`,
    ])
    .join('\n  ');

  const jsonLd = structuredData
    .map((data) => `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`)
    .join('\n  ');

  return `<!doctype html>
<html lang="${esc(ctx.t.locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
  ${alternates}

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(ctx.site.name)}">
  <meta property="og:locale" content="${esc(ctx.t.locale.replace('-', '_'))}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:width" content="${esc(ctx.site.images.ogImage.width)}">
  <meta property="og:image:height" content="${esc(ctx.site.images.ogImage.height)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">
  <meta name="theme-color" content="#F2ECDD">

  <link rel="icon" href="${esc(ctx.asset('/assets/img/favicon.svg'))}" type="image/svg+xml">

  <!-- Tipos de letra alojados localmente: sem pedidos a terceiros.
       Só os ficheiros usados acima da dobra são pré-carregados. -->
  ${PRELOAD_FONTS.map(
    (file) =>
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="${esc(
        ctx.asset(`/assets/fonts/${file}`)
      )}">`
  ).join('\n  ')}
  <link rel="stylesheet" href="${esc(ctx.asset('/assets/css/fonts.css'))}">
  <link rel="stylesheet" href="${esc(ctx.asset('/assets/css/main.css'))}">
  ${jsonLd}
</head>
<body class="${esc(bodyClass)}">
${header(ctx)}

<main id="conteudo">
${body}
</main>

${footer(ctx)}

<script src="${esc(ctx.asset('/assets/js/main.js'))}" defer></script>
</body>
</html>
`;
}

/* Dados estruturados de Person, partilhados pela Home e pela página Sobre mim. */
function personSchema(ctx) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: ctx.site.name,
    jobTitle: ctx.t.person.jobTitle,
    description: ctx.t.person.description,
    url: ctx.absolute(ctx.url('home')),
    image: ctx.absolute(ctx.site.images.heroPortrait.src),
    email: `mailto:${ctx.site.contact.email}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PT',
      addressLocality: ctx.site.contact.addressLines[2] || 'Lisboa',
      streetAddress: ctx.site.contact.addressLines[1] || '',
    },
    sameAs: ctx.site.social.map((item) => item.url),
  };
}

module.exports = { layout, personSchema, join };
