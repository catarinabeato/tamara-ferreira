'use strict';

const { esc } = require('../lib/html');
const { layout } = require('./layout');

/* Páginas de texto corrido: Política de Privacidade e Termos e Condições. */
module.exports = function legal(ctx, key) {
  const t = ctx.t;
  const doc = t.legal[key];

  const body = `
<section class="page-head page-head--legal" aria-labelledby="legal-title">
  <div class="wrap wrap--narrow">
    <h1 class="page-head__title" id="legal-title">${esc(doc.title)}</h1>
    <p class="note">${esc(doc.updated)}</p>
    <p class="lede">${esc(doc.intro)}</p>
  </div>
</section>

<section class="section">
  <div class="wrap wrap--narrow prose">
    ${doc.sections
      .map(
        (section) => `<div class="story__block">
      <h2 class="story__title story__title--small">${esc(section.title)}</h2>
      ${section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </div>`
      )
      .join('\n    ')}
  </div>
</section>`;

  return layout(ctx, {
    title: t.meta[key].title,
    description: t.meta[key].description,
    bodyClass: 'page-legal',
    body,
  });
};
