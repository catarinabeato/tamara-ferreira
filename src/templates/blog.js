'use strict';

const { esc, join, attrs, headline, formatDate } = require('../lib/html');
const { layout } = require('./layout');
const { figure, kicker, newsletter } = require('./partials');

/* Cartão minimal: imagem, categoria, título, data. */
function postCard(ctx, post) {
  const date = formatDate(post.date, ctx.t.locale);
  const href = ctx.postUrl(post);

  return `<article class="card"${attrs({ 'data-category': post.category })}>
        <a class="card__link" href="${esc(href)}">
          ${figure(ctx, post.image, ctx.t.imageAlt[post.image], { className: 'media--card' })}
          <p class="card__meta">
            <span class="label">${esc(ctx.t.categories[post.category])}</span>
            <time class="card__date" datetime="${esc(date.iso)}">${esc(date.label)}</time>
          </p>
          <h3 class="card__title">${esc(post.title)}</h3>
          <p class="card__excerpt">${esc(post.excerpt)}</p>
          <span class="card__cue" aria-hidden="true">${esc(ctx.t.ui.readArticle)}</span>
        </a>
      </article>`;
}

/* Listagem completa com filtro por tema. Sem JavaScript, mostra tudo. */
function blogIndex(ctx) {
  const t = ctx.t;
  const b = t.blogPage;

  const usedCategories = Object.keys(t.categories).filter((key) =>
    ctx.posts.some((post) => post.category === key)
  );

  const filters = `
    <div class="filters" role="group" aria-label="${esc(b.filterLabel)}" data-filters>
      <button class="filter is-active" type="button" data-filter="all" aria-pressed="true">${esc(b.all)}</button>
      ${usedCategories
        .map(
          (key) =>
            `<button class="filter" type="button" data-filter="${esc(key)}" aria-pressed="false">${esc(
              t.categories[key]
            )}</button>`
        )
        .join('\n      ')}
    </div>`;

  const body = `
<section class="page-head" aria-labelledby="blog-title">
  <div class="wrap page-head__inner">
    ${kicker(b.kicker)}
    ${headline(b.headlineLines, { tag: 'h1', id: 'blog-title' })}
    <p class="lede lede--wide">${esc(b.standfirst)}</p>
  </div>
</section>

<section class="section section--list" aria-labelledby="list-title">
  <div class="wrap">
    <h2 class="visually-hidden" id="list-title">${esc(t.nav.blog)}</h2>
    ${filters}
    <div class="cards cards--list" data-post-list>
      ${ctx.posts.map((post) => postCard(ctx, post)).join('\n      ')}
    </div>
    <p class="empty-state" data-empty hidden>${esc(b.empty)}</p>
  </div>
</section>

${newsletter(ctx)}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${ctx.site.name} — ${t.nav.blog}`,
    url: ctx.absolute(ctx.url('blog')),
    inLanguage: t.locale,
    blogPost: ctx.posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      url: ctx.absolute(ctx.postUrl(post)),
    })),
  };

  return layout(ctx, {
    title: t.meta.blog.title,
    description: t.meta.blog.description,
    bodyClass: 'page-blog',
    structuredData: [schema],
    body,
  });
}

/* Página individual de artigo: coluna estreita e artigos relacionados. */
function blogPost(ctx, post) {
  const t = ctx.t;
  const date = formatDate(post.date, t.locale);

  const blocks = post.body
    .map((block) => {
      if (block.type === 'h') return `<h2>${esc(block.text)}</h2>`;
      if (block.type === 'quote') return `<blockquote><p>${esc(block.text)}</p></blockquote>`;
      return `<p>${esc(block.text)}</p>`;
    })
    .join('\n      ');

  /* Relacionados: mesma categoria primeiro, completando com os mais recentes. */
  const sameCategory = ctx.posts.filter((p) => p.id !== post.id && p.category === post.category);
  const others = ctx.posts.filter((p) => p.id !== post.id && p.category !== post.category);
  const related = sameCategory.concat(others).slice(0, 3);

  const body = `
<article class="article">
  <header class="article__head">
    <div class="wrap wrap--narrow">
      <p class="article__meta">
        <a class="label label--link" href="${esc(ctx.url('blog'))}">${esc(t.categories[post.category])}</a>
        <time datetime="${esc(date.iso)}">${esc(date.label)}</time>
      </p>
      <h1 class="article__title">${esc(post.title)}</h1>
      <p class="lede">${esc(post.excerpt)}</p>
    </div>
  </header>

  <div class="wrap article__media">
    ${figure(ctx, post.image, t.imageAlt[post.image], { eager: true })}
  </div>

  <div class="wrap wrap--narrow article__body">
    ${blocks}
  </div>

  <div class="wrap wrap--narrow article__foot">
    <p><a class="link-arrow link-arrow--back" href="${esc(ctx.url('blog'))}">${esc(t.ui.backToBlog)}</a></p>
  </div>
</article>

<section class="section section--related" aria-labelledby="related-title">
  <div class="wrap">
    <h2 class="section__title" id="related-title">${esc(t.blogPage.relatedTitle)}</h2>
    <div class="cards">
      ${related.map((item) => postCard(ctx, item)).join('\n      ')}
    </div>
  </div>
</section>

${newsletter(ctx)}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: t.locale,
    articleSection: t.categories[post.category],
    image: ctx.absolute(ctx.site.images[post.image].src),
    mainEntityOfPage: ctx.absolute(ctx.postUrl(post)),
    author: { '@type': 'Person', name: ctx.site.name, url: ctx.absolute(ctx.url('home')) },
    publisher: { '@type': 'Person', name: ctx.site.name },
  };

  return layout(ctx, {
    title: post.title + t.meta.postSuffix,
    description: post.excerpt,
    bodyClass: 'page-article',
    structuredData: [schema],
    body,
  });
}

module.exports = { blogIndex, blogPost, postCard, join };
