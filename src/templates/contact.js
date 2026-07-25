'use strict';

const { esc, join, attrs, headline } = require('../lib/html');
const { layout } = require('./layout');
const { kicker, socialList } = require('./partials');

module.exports = function contact(ctx) {
  const t = ctx.t;
  const c = t.contact;
  const endpoint = ctx.site.forms.contactEndpoint || '';

  const form = `
<form class="form form--contact"${attrs({
    action: endpoint || false,
    method: endpoint ? 'post' : false,
    'data-form': 'contact',
    'data-endpoint': endpoint || false,
    'data-fallback-email': endpoint ? false : ctx.site.contact.email,
    novalidate: true,
  })}>
      <h2 class="form__title">${esc(c.formTitle)}</h2>

      <div class="field">
        <label class="field__label" for="ct-name">${esc(c.nameLabel)}</label>
        <input class="field__input" type="text" id="ct-name" name="name" autocomplete="name" required>
      </div>

      <div class="field">
        <label class="field__label" for="ct-email">${esc(c.emailLabel)}</label>
        <input class="field__input" type="email" id="ct-email" name="email" autocomplete="email" required>
      </div>

      <div class="field">
        <label class="field__label" for="ct-subject">${esc(c.subjectLabel)}</label>
        <select class="field__input field__select" id="ct-subject" name="subject" required>
          ${c.subjectOptions
            .map((option) => `<option value="${esc(option)}">${esc(option)}</option>`)
            .join('\n          ')}
        </select>
      </div>

      <div class="field">
        <label class="field__label" for="ct-message">${esc(c.messageLabel)}</label>
        <textarea class="field__input field__textarea" id="ct-message" name="message" rows="7" required
                  placeholder="${esc(c.messagePlaceholder)}"></textarea>
      </div>

      <div class="field field--check">
        <input class="field__check" type="checkbox" id="ct-consent" name="consent" required>
        <label class="field__check-label" for="ct-consent">
          ${esc(c.consent)}
          <a href="${esc(ctx.url('privacy'))}">${esc(c.consentLinkText)}</a>.
        </label>
      </div>

      <div class="field field--action">
        <button class="button" type="submit">${esc(c.submit)}</button>
      </div>

      <p class="form__status" data-form-status role="status" aria-live="polite"
         data-success="${esc(c.success)}" data-error="${esc(c.error)}" data-sending="${esc(t.ui.sending)}"></p>
    </form>`;

  const body = `
<section class="page-head" aria-labelledby="contact-title">
  <div class="wrap page-head__inner">
    ${kicker(c.kicker)}
    ${headline(c.headlineLines, { tag: 'h1', id: 'contact-title' })}
    <p class="lede lede--wide">${esc(c.standfirst)}</p>
  </div>
</section>

<section class="section section--contact-page">
  <div class="wrap grid grid--form">
    <div class="grid__form">
      ${form}
    </div>

    <aside class="grid__aside">
      <div class="contact-block">
        <h2 class="label">${esc(c.directTitle)}</h2>
        <p><a href="mailto:${esc(ctx.site.contact.email)}">${esc(ctx.site.contact.email)}</a></p>
        <p><a href="tel:${esc(ctx.site.contact.phoneHref)}">${esc(ctx.site.contact.phone)}</a></p>
        <p class="note">${esc(c.responseNote)}</p>
      </div>

      <div class="contact-block">
        <h2 class="label">${esc(c.addressTitle)}</h2>
        <p class="address">${ctx.site.contact.addressLines.map(esc).join('<br>')}</p>
        <p><a class="link-arrow" href="${esc(ctx.site.contact.mapLink)}" target="_blank"
              rel="noopener noreferrer">${esc(c.mapLink)}</a></p>
      </div>

      <div class="contact-block">
        <h2 class="label">${esc(c.socialTitle)}</h2>
        ${socialList(ctx, 'social social--stack')}
      </div>
    </aside>
  </div>
</section>

<section class="section section--map" aria-label="${esc(c.mapTitle)}">
  <div class="wrap">
    <div class="map">
      <iframe src="${esc(ctx.site.contact.mapEmbed)}" title="${esc(c.mapTitle)}" loading="lazy"
              referrerpolicy="no-referrer-when-downgrade" width="600" height="450"></iframe>
    </div>
  </div>
</section>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: t.meta.contact.title,
    url: ctx.absolute(ctx.url('contact')),
    inLanguage: t.locale,
    mainEntity: {
      '@type': 'Person',
      name: ctx.site.name,
      email: `mailto:${ctx.site.contact.email}`,
      telephone: ctx.site.contact.phoneHref,
    },
  };

  return layout(ctx, {
    title: t.meta.contact.title,
    description: t.meta.contact.description,
    bodyClass: 'page-contact',
    structuredData: [schema],
    body,
  });
};
