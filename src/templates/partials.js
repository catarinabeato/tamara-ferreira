'use strict';

const { esc, join, attrs } = require('../lib/html');

/*
 * Imagem responsiva.
 * As proporções de cada ficheiro estão documentadas em content/site.json → images.
 * Se colocar versões .webp / .avif com o mesmo nome base, active-as com
 * formats: ['avif', 'webp'] na entrada correspondente de site.json.
 */
function image(ctx, key, options = {}) {
  const entry = ctx.site.images[key];
  if (!entry) throw new Error(`Imagem desconhecida em site.json → images: "${key}"`);

  const alt = options.alt !== undefined ? options.alt : '';
  const src = ctx.asset(entry.src);
  const eager = options.eager === true;

  const imgTag = `<img${attrs({
    src,
    alt,
    width: entry.width,
    height: entry.height,
    loading: eager ? 'eager' : 'lazy',
    decoding: eager ? 'sync' : 'async',
    fetchpriority: eager ? 'high' : false,
    class: options.className || false,
  })}>`;

  const formats = Array.isArray(entry.formats) ? entry.formats : [];
  if (formats.length === 0) return imgTag;

  const base = entry.src.replace(/\.[a-z0-9]+$/i, '');
  const sources = formats
    .map((format) => `<source srcset="${esc(ctx.asset(`${base}.${format}`))}" type="image/${esc(format)}">`)
    .join('\n      ');

  return `<picture>\n      ${sources}\n      ${imgTag}\n    </picture>`;
}

/* Figura com proporção fixa, para manter a grelha estável enquanto carrega. */
function figure(ctx, key, alt, options = {}) {
  const entry = ctx.site.images[key];
  const ratio = `${entry.width} / ${entry.height}`;
  return join([
    `<div class="media${options.className ? ' ' + options.className : ''}" style="--media-ratio: ${ratio}">`,
    `    ${image(ctx, key, { alt, eager: options.eager })}`,
    `  </div>`,
  ]);
}

function kicker(text, tag = 'p') {
  return `<${tag} class="kicker">${esc(text)}</${tag}>`;
}

/*
 * Ícones das redes sociais. A chave é o nome em site.json em minúsculas e sem
 * espaços; se não houver ícone para uma rede, o nome aparece em texto.
 */
const SOCIAL_ICONS = {
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.2 9h3.6v12H3.2V9Zm6.4 0h3.45v1.64h.05c.48-.9 1.75-1.86 3.6-1.86 3.85 0 4.56 2.4 4.56 5.5V21h-3.6v-5.5c0-1.31-.02-3-1.85-3-1.86 0-2.14 1.4-2.14 2.9V21H9.6V9Z"/></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M22.6 7.2a2.7 2.7 0 0 0-1.9-1.9C19 4.85 12 4.85 12 4.85s-7 0-8.7.45A2.7 2.7 0 0 0 1.4 7.2C.95 8.9.95 12 .95 12s0 3.1.45 4.8a2.7 2.7 0 0 0 1.9 1.9c1.7.45 8.7.45 8.7.45s7 0 8.7-.45a2.7 2.7 0 0 0 1.9-1.9c.45-1.7.45-4.8.45-4.8s0-3.1-.45-4.8ZM9.75 15.3V8.7L15.5 12l-5.75 3.3Z"/></svg>',
};

/* Seta longa do CTA, no espírito da referência. */
const ARROW =
  '<svg class="arrow" viewBox="0 0 72 10" aria-hidden="true" focusable="false"><path d="M0 5h67M61 1l6 4-6 4" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>';

function socialIcons(ctx, className = 'social-icons') {
  return `<ul class="${esc(className)}" aria-label="${esc(ctx.t.ui.socialNav)}">
      ${ctx.site.social
        .map((item) => {
          const icon = SOCIAL_ICONS[item.name.toLowerCase().replace(/[^a-z0-9]/g, '')];
          const label = icon
            ? `<span class="visually-hidden">${esc(item.name)}</span>`
            : `<span class="social-icons__text">${esc(item.name)}</span>`;
          return `<li><a href="${esc(item.url)}" rel="me noopener noreferrer" target="_blank">${
            icon || ''
          }${label}</a></li>`;
        })
        .join('\n      ')}
    </ul>`;
}

/* Alterna entre PT e EN mantendo o visitante na página equivalente. */
function languageSwitch(ctx) {
  const t = ctx.t;
  return ctx.languages
    .map((lang) => {
      const active = lang.code === ctx.lang;
      return active
        ? `<span class="lang__item is-current"${attrs({ 'aria-current': 'true', title: t.ui.currentLanguage })}>${esc(
            lang.label
          )}</span>`
        : `<a class="lang__item"${attrs({ href: lang.href, hreflang: lang.code, lang: lang.code, title: t.ui.switchTo })}>${esc(
            lang.label
          )}</a>`;
    })
    .join('');
}

function navLinksFor(ctx) {
  const t = ctx.t;
  return [
    { label: t.nav.about, href: ctx.url('about') },
    { label: t.nav.blog, href: ctx.url('blog') },
    { label: t.nav.contact, href: ctx.url('contact') },
  ];
}

function mobileMenu(ctx) {
  const t = ctx.t;
  return `
  <div class="mobile-menu" id="menu-mobile" hidden>
    <nav aria-label="${esc(t.ui.menu)}">
      <ul class="mobile-menu__list">
        ${navLinksFor(ctx)
          .map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`)
          .join('\n        ')}
      </ul>
    </nav>
    <p class="mobile-menu__lang" role="group" aria-label="${esc(t.ui.languageNav)}">${languageSwitch(ctx)}</p>
  </div>`;
}

function navToggle(ctx) {
  const t = ctx.t;
  return `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu-mobile" data-nav-toggle>
      <span class="nav-toggle__label" data-nav-label-open="${esc(t.ui.menu)}" data-nav-label-close="${esc(
        t.ui.close
      )}">${esc(t.ui.menu)}</span>
      <span class="visually-hidden" data-nav-sr>${esc(t.ui.openMenu)}</span>
    </button>`;
}

/*
 * Cabeçalho.
 *
 * Na Home usa a variante sobreposta: barra transparente por cima da
 * fotografia de capa, com as redes à esquerda e o CTA à direita. Aí o nome
 * gigante da capa faz de lettermark e a navegação vive na faixa preta, por
 * baixo da fotografia (ver hero-cover, em home.js).
 *
 * Nas páginas interiores mantém-se a barra fixa, com o nome ao centro.
 */
function header(ctx) {
  const t = ctx.t;
  const isCover = ctx.pageId === 'home';
  const isCurrent = (href) => href === ctx.currentPath;

  const link = (item) =>
    `<li><a class="nav__link${isCurrent(item.href) ? ' is-current' : ''}"${attrs({
      href: item.href,
      'aria-current': isCurrent(item.href) ? 'page' : false,
    })}>${esc(item.label)}</a></li>`;

  if (isCover) {
    return `
<header class="site-header site-header--overlay" id="topo">
  <a class="skip-link" href="#conteudo">${esc(t.ui.skipToContent)}</a>
  <div class="site-header__inner site-header__inner--overlay">
    ${socialIcons(ctx)}
    <a class="header-cta" href="${esc(ctx.t.home.hero.ctaHref)}">
      <span>${esc(ctx.t.home.hero.cta)}</span>${ARROW}
    </a>
    ${navToggle(ctx)}
  </div>
${mobileMenu(ctx)}
</header>`;
  }

  const navLinks = navLinksFor(ctx);

  return `
<header class="site-header" id="topo">
  <a class="skip-link" href="#conteudo">${esc(t.ui.skipToContent)}</a>
  <div class="site-header__inner">
    <nav class="nav nav--left" aria-label="${esc(t.ui.mainNav)}">
      <ul class="nav__list">
        ${link(navLinks[0])}
        ${link(navLinks[1])}
      </ul>
    </nav>

    <p class="lettermark"><a href="${esc(ctx.url('home'))}">${esc(ctx.site.name)}</a></p>

    <nav class="nav nav--right" aria-label="${esc(t.ui.languageNav)}">
      <ul class="nav__list">
        ${link(navLinks[2])}
        <li class="lang" role="group" aria-label="${esc(t.ui.languageNav)}">${languageSwitch(ctx)}</li>
      </ul>
    </nav>

    ${navToggle(ctx)}
  </div>
${mobileMenu(ctx)}
</header>`;
}

/* Navegação da faixa preta da capa, dividida à volta do nome. */
function coverNav(ctx) {
  const t = ctx.t;
  const navLinks = navLinksFor(ctx);
  const link = (item) => `<li><a class="nav__link" href="${esc(item.href)}">${esc(item.label)}</a></li>`;

  return `<nav class="cover-nav" aria-label="${esc(t.ui.mainNav)}">
      <ul class="cover-nav__list cover-nav__list--left">
        ${link(navLinks[0])}
        ${link(navLinks[1])}
      </ul>
      <ul class="cover-nav__list cover-nav__list--right">
        ${link(navLinks[2])}
        <li class="lang" role="group" aria-label="${esc(t.ui.languageNav)}">${languageSwitch(ctx)}</li>
      </ul>
    </nav>`;
}

function newsletter(ctx, { id = 'newsletter' } = {}) {
  const n = ctx.t.newsletter;
  const endpoint = ctx.site.forms.newsletterEndpoint || '';

  return `
<section class="section newsletter" id="${esc(id)}" aria-labelledby="newsletter-title">
  <div class="wrap newsletter__inner">
    <div class="newsletter__intro">
      ${kicker(n.kicker)}
      <h2 class="section__title" id="newsletter-title">${esc(n.title)}</h2>
      <p class="lede">${esc(n.text)}</p>
    </div>

    <form class="form form--newsletter"${attrs({
      action: endpoint || false,
      method: endpoint ? 'post' : false,
      'data-form': 'newsletter',
      'data-endpoint': endpoint || false,
      'data-fallback-email': endpoint ? false : ctx.site.contact.email,
      novalidate: true,
    })}>
      <div class="field">
        <label class="field__label" for="nl-name">${esc(n.nameLabel)}</label>
        <input class="field__input" type="text" id="nl-name" name="name" autocomplete="name" required
               placeholder="${esc(n.namePlaceholder)}">
      </div>
      <div class="field">
        <label class="field__label" for="nl-email">${esc(n.emailLabel)}</label>
        <input class="field__input" type="email" id="nl-email" name="email" autocomplete="email" required
               placeholder="${esc(n.emailPlaceholder)}">
      </div>
      <div class="field field--check">
        <input class="field__check" type="checkbox" id="nl-consent" name="consent" required>
        <label class="field__check-label" for="nl-consent">${esc(n.consent)}</label>
      </div>
      <div class="field field--action">
        <button class="button button--light" type="submit">${esc(n.submit)}</button>
      </div>
      <p class="form__note">
        ${esc(n.privacyNote)} <a href="${esc(ctx.url('privacy'))}">${esc(n.privacyLink)}</a>.
      </p>
      <p class="form__status" data-form-status role="status" aria-live="polite"
         data-success="${esc(n.success)}" data-error="${esc(n.error)}" data-sending="${esc(ctx.t.ui.sending)}"></p>
    </form>
  </div>
</section>`;
}

function socialList(ctx, className = 'social') {
  return `<ul class="${esc(className)}" aria-label="${esc(ctx.t.ui.socialNav)}">
      ${ctx.site.social
        .map(
          (item) =>
            `<li><a href="${esc(item.url)}" rel="me noopener noreferrer" target="_blank">${esc(item.name)}</a></li>`
        )
        .join('\n      ')}
    </ul>`;
}

function footer(ctx) {
  const t = ctx.t;
  const year = ctx.year;

  return `
<footer class="site-footer">
  <div class="wrap site-footer__inner">
    <div class="site-footer__brand">
      <p class="lettermark lettermark--footer"><a href="${esc(ctx.url('home'))}">${esc(ctx.site.name)}</a></p>
      <p class="site-footer__tagline">${esc(t.footer.tagline)}</p>
    </div>

    <nav class="site-footer__col" aria-label="${esc(t.ui.footerNav)}">
      <h2 class="site-footer__title">${esc(t.footer.navTitle)}</h2>
      <ul class="site-footer__list">
        <li><a href="${esc(ctx.url('about'))}">${esc(t.nav.about)}</a></li>
        <li><a href="${esc(ctx.url('blog'))}">${esc(t.nav.blog)}</a></li>
        <li><a href="${esc(ctx.url('contact'))}">${esc(t.nav.contact)}</a></li>
      </ul>
    </nav>

    <div class="site-footer__col">
      <h2 class="site-footer__title">${esc(t.ui.socialNav)}</h2>
      ${socialList(ctx, 'site-footer__list')}
    </div>

    <div class="site-footer__col">
      <h2 class="site-footer__title">${esc(t.footer.legalTitle)}</h2>
      <ul class="site-footer__list">
        <li><a href="${esc(ctx.url('privacy'))}">${esc(t.legal.privacy.title)}</a></li>
        <li><a href="${esc(ctx.url('terms'))}">${esc(t.legal.terms.title)}</a></li>
      </ul>
    </div>
  </div>

  <div class="wrap site-footer__base">
    <p>&copy; ${year} ${esc(ctx.site.name)}. ${esc(t.footer.copyright)}</p>
    <p>${esc(t.footer.credits)}</p>
  </div>
</footer>`;
}

module.exports = { image, figure, kicker, header, footer, newsletter, socialList, socialIcons, coverNav };
