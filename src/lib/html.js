'use strict';

/* Pequenos utilitários de renderização. Sem dependências externas. */

const esc = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* Junta fragmentos ignorando null / false / undefined. */
const join = (parts, separator = '\n') =>
  parts.filter((part) => part !== null && part !== undefined && part !== false && part !== '').join(separator);

const attrs = (map) =>
  Object.entries(map)
    .filter(([, value]) => value !== null && value !== undefined && value !== false && value !== '')
    .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${esc(value)}"`))
    .join('');

/* Converte um id de secção/página num id HTML seguro. */
const slugify = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/*
 * Headline editorial: alterna romano (maiúsculas) e itálico na mesma frase,
 * com quebras de linha manuais definidas no ficheiro de conteúdo.
 */
const headline = (lines, { tag = 'h1', className = '', id = '' } = {}) => {
  const rendered = lines
    .map(
      (line) =>
        `<span class="headline__line headline__line--${line.style === 'italic' ? 'italic' : 'roman'}">${esc(
          line.text
        )}</span>`
    )
    .join('\n      ');
  return `<${tag} class="headline${className ? ' ' + className : ''}"${
    id ? ` id="${id}"` : ''
  }>\n      ${rendered}\n    </${tag}>`;
};

/* Texto plano de um headline, para <title>, aria-label ou metadados. */
const headlineText = (lines) => lines.map((line) => line.text).join(' ');

/*
 * Data legível na língua da página. Recebe "YYYY-MM-DD" e devolve
 * { iso, label } — nunca depende do fuso horário local.
 */
const formatDate = (iso, locale) => {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const label = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  return { iso, label };
};

module.exports = { esc, join, attrs, slugify, headline, headlineText, formatDate };
