'use strict';

const { esc, join, headline, formatDate } = require('../lib/html');
const { layout, personSchema } = require('./layout');
const { figure, kicker, newsletter, socialList } = require('./partials');
const { postCard } = require('./blog');

module.exports = function home(ctx) {
  const t = ctx.t;
  const h = t.home;

  /* 1. HERO — fotografia dominante, headline sobreposto, um único CTA. */
  const hero = `
<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero__inner">
    <div class="hero__media">
      ${figure(ctx, 'heroPortrait', t.imageAlt.heroPortrait, { eager: true, className: 'media--hero' })}
    </div>

    <div class="hero__text">
      ${kicker(h.hero.kicker)}
      ${headline(h.hero.headlineLines, { tag: 'h1', className: 'headline--hero', id: 'hero-title' })}
      <p class="hero__standfirst">${esc(h.hero.standfirst)}</p>
      <p class="hero__cta">
        <a class="button" href="${esc(h.hero.ctaHref)}">${esc(h.hero.cta)}</a>
      </p>
    </div>

    <p class="hero__vertical" aria-hidden="true">${esc(t.person.jobTitle)}</p>
  </div>
</section>`;

  /* 2. SOBRE MIM (resumo) */
  const about = `
<section class="section section--about" id="sobre" aria-labelledby="about-title">
  <div class="wrap grid grid--about">
    <div class="grid__media">
      ${figure(ctx, 'aboutPortrait', t.imageAlt.aboutPortrait)}
    </div>
    <div class="grid__text">
      ${kicker(h.about.kicker)}
      <h2 class="section__title" id="about-title">${esc(h.about.title)}</h2>
      ${h.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <p class="more"><a class="link-arrow" href="${esc(ctx.url('about'))}">${esc(h.about.link)}</a></p>
    </div>
  </div>
</section>`;

  /* 3. LIDERANÇA COM PROPÓSITO — lista editorial numerada */
  const purpose = `
<section class="section section--purpose" id="proposito" aria-labelledby="purpose-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker(h.purpose.kicker)}
      <h2 class="section__title section__title--wide" id="purpose-title">${esc(h.purpose.title)}</h2>
      <p class="lede">${esc(h.purpose.intro)}</p>
    </div>

    <ol class="tenets">
      ${h.purpose.items
        .map(
          (item, index) => `<li class="tenet">
        <span class="tenet__index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
        <h3 class="tenet__title">${esc(item.title)}</h3>
        <p class="tenet__text">${esc(item.text)}</p>
      </li>`
        )
        .join('\n      ')}
    </ol>
  </div>
</section>`;

  /* Projectos — as duas fotografias entregues */
  const projects = `
<section class="section section--projects" id="projectos" aria-labelledby="projects-title">
  <div class="wrap">
    <div class="section__head">
      ${kicker(h.projects.kicker)}
      <h2 class="section__title" id="projects-title">${esc(h.projects.title)}</h2>
    </div>

    <div class="projects">
      ${h.projects.items
        .map(
          (item, index) => `<article class="project${index % 2 ? ' project--offset' : ''}">
        ${figure(ctx, item.image, t.imageAlt[item.image])}
        <div class="project__body">
          <p class="label">${esc(item.label)}</p>
          <h3 class="project__title">${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
        </div>
      </article>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

  /* 4. BLOG — três artigos mais recentes */
  const latest = ctx.posts.slice(0, 3);
  const blog = `
<section class="section section--blog" id="blog" aria-labelledby="home-blog-title">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div>
        ${kicker(h.blog.kicker)}
        <h2 class="section__title" id="home-blog-title">${esc(h.blog.title)}</h2>
        <p class="lede">${esc(h.blog.intro)}</p>
      </div>
      <p class="more"><a class="link-arrow" href="${esc(ctx.url('blog'))}">${esc(h.blog.link)}</a></p>
    </div>

    <div class="cards">
      ${latest.map((post) => postCard(ctx, post)).join('\n      ')}
    </div>
  </div>
</section>`;

  /* 6. CONTACTOS (resumo) */
  const contact = `
<section class="section section--contact" id="contactos" aria-labelledby="home-contact-title">
  <div class="wrap grid grid--contact">
    <div class="grid__text">
      ${kicker(h.contact.kicker)}
      <h2 class="section__title" id="home-contact-title">${esc(h.contact.title)}</h2>
      <p class="lede">${esc(h.contact.text)}</p>
      <p class="more"><a class="link-arrow" href="${esc(ctx.url('contact'))}">${esc(h.contact.link)}</a></p>
    </div>

    <div class="contact-blocks">
      <div class="contact-block">
        <h3 class="label">${esc(h.contact.emailLabel)}</h3>
        <p><a href="mailto:${esc(ctx.site.contact.email)}">${esc(ctx.site.contact.email)}</a></p>
      </div>
      <div class="contact-block">
        <h3 class="label">${esc(h.contact.addressLabel)}</h3>
        <p class="address">${ctx.site.contact.addressLines.map(esc).join('<br>')}</p>
      </div>
      <div class="contact-block">
        <h3 class="label">${esc(h.contact.socialLabel)}</h3>
        ${socialList(ctx, 'social social--stack')}
      </div>
    </div>
  </div>
</section>`;

  const body = join([hero, about, purpose, projects, blog, newsletter(ctx), contact], '\n');

  const schema = [
    personSchema(ctx),
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: ctx.site.name,
      url: ctx.absolute(ctx.url('home')),
      inLanguage: ctx.t.locale,
    },
  ];

  return layout(ctx, {
    title: t.meta.home.title,
    description: t.meta.home.description,
    bodyClass: 'page-home',
    structuredData: schema,
    body,
  });
};
