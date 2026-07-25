'use strict';

const { esc, join, headline } = require('../lib/html');
const { layout, personSchema } = require('./layout');
const { figure, kicker, newsletter } = require('./partials');

module.exports = function about(ctx) {
  const t = ctx.t;
  const a = t.about;

  const head = `
<section class="page-head page-head--about" aria-labelledby="about-page-title">
  <div class="wrap page-head__inner page-head__inner--split">
    <div class="page-head__text">
      ${kicker(a.kicker)}
      ${headline(a.headlineLines, { tag: 'h1', id: 'about-page-title' })}
      <p class="lede">${esc(a.standfirst)}</p>
    </div>
    <div class="page-head__media">
      ${figure(ctx, 'aboutFull', t.imageAlt.aboutFull, { eager: true })}
    </div>
  </div>
</section>`;

  /* Percurso em narrativa — prosa, não currículo em tópicos. */
  const story = `
<section class="section section--story" aria-label="${esc(a.kicker)}">
  <div class="wrap wrap--narrow prose">
    ${a.sections
      .map(
        (section) => `<div class="story__block">
      <h2 class="story__title">${esc(section.title)}</h2>
      ${section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </div>`
      )
      .join('\n    ')}
  </div>
</section>`;

  const asSeenIn = `
<section class="section section--logos" aria-labelledby="seen-title">
  <div class="wrap">
    <h2 class="kicker" id="seen-title">${esc(a.asSeenIn.kicker)}</h2>
    <!-- Substituir por logótipos: <img src="/assets/img/logo-x.svg" alt="Nome" width="160" height="40"> -->
    <ul class="logos">
      ${a.asSeenIn.items.map((item) => `<li class="logos__item">${esc(item)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

  const testimonials = `
<section class="section section--quotes" aria-labelledby="quotes-title">
  <div class="wrap">
    <h2 class="kicker" id="quotes-title">${esc(a.testimonials.kicker)}</h2>
    <div class="quotes">
      ${a.testimonials.items
        .map(
          (item) => `<figure class="quote">
        <blockquote class="quote__text"><p>${esc(item.quote)}</p></blockquote>
        <figcaption class="quote__source">
          <span class="quote__author">${esc(item.author)}</span>
          <span class="quote__role">${esc(item.role)}</span>
        </figcaption>
      </figure>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

  const cta = `
<section class="section section--cta">
  <div class="wrap wrap--narrow center">
    <h2 class="section__title">${esc(a.cta.title)}</h2>
    <p class="lede">${esc(a.cta.text)}</p>
    <p><a class="button" href="${esc(ctx.url('contact'))}">${esc(a.cta.button)}</a></p>
  </div>
</section>`;

  const body = join([head, story, asSeenIn, testimonials, cta, newsletter(ctx)], '\n');

  return layout(ctx, {
    title: t.meta.about.title,
    description: t.meta.about.description,
    bodyClass: 'page-about',
    structuredData: [personSchema(ctx)],
    body,
  });
};
