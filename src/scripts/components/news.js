/**
 * HABER — Card/Haber, Haber Kartı/Görsel Üzeri (manşet), nav-number, Son Dakika öğesi.
 */
import { attr, cls, tickerChip, sectionTitle } from './atoms.js';

const time = ({ time: text, datetime }, className) => `<time${attr('class', className)}${attr('datetime', datetime)}>${text}</time>`;

/** Kategori · zaman satırı */
const newsMeta = (item) =>
  `<p class="news-meta"><span class="t-body-xs-medium">${item.category}</span><span class="news-meta__dot" aria-hidden="true">·</span>${time(item, 't-body-xs-medium')}</p>`;

/** Card/Haber — görsel varsa büyük, yoksa kompakt */
export const newsCard = (item) => `<article class="${cls('card-featured', !item.image && 'card-featured--compact')}">${item.image
  ? `<img class="card-featured__img" src="${item.image.src}" width="${item.image.width}" height="${item.image.height}" alt="" loading="lazy">` : ''}<h3 class="card-featured__title t-h6-semibold"><a href="#">${item.title}</a></h3><div class="card-featured__meta">${newsMeta(item)}${tickerChip(item.ticker)}</div></article>`;

/** Liste öğesi olarak kart (extra: yalnız desktop'ta görünür — manşet yan listesi) */
export const newsCardItem = (item) => `<li${attr('class', item.extra && 'top-stories__extra')}>${newsCard(item)}</li>`;

/** Haber Kartı/Görsel Üzeri — manşet slaytı (ilki aktif ve hemen yüklenir) */
export const heroSlide = (item, i, count) => `<div class="${cls('news-hero', i === 0 && 'is-active')}" role="group" aria-roledescription="slayt" aria-label="${i + 1} / ${count}">
  <img class="news-hero__img" src="${item.image}" width="1600" height="1066" alt="${item.alt}"${attr('loading', i > 0 && 'lazy')}>
  <div class="news-hero__body">
    <p class="news-hero__meta t-body-s-medium"><span>${item.category}</span><span class="news-hero__dot" aria-hidden="true">·</span>${time(item)}</p>
    <h2 class="news-hero__title t-display-bold"><a href="#">${item.title}</a></h2>
    <ul class="news-hero__tickers" aria-label="İlgili hisseler">${item.tickers.map((t) => `<li>${tickerChip(t, { solid: true })}</li>`).join('')}</ul>
  </div>
</div>`;

/** nav-number — manşet sayfa numarası (desktop) / nokta (tablet-mobil) */
export const navNumber = (_, i) =>
  `<li><button class="nav-number t-body-s-medium" type="button" aria-label="${i + 1}. manşet"${attr('aria-current', i === 0 && 'true')}>${i + 1}</button></li>`;

/** Son Dakika Akışı öğesi */
export const breakingItem = (title) => `<li class="breaking-news__item"><a class="t-h6-semibold" href="#">${title}</a></li>`;

/** Haber kolonu — Section/Başlık + kart listesi (ilk kart görselli) */
export const newsColumn = (col) => `<section class="news-column" aria-labelledby="${col.slot}-title" data-slot="${col.slot}">
  ${sectionTitle({ id: `${col.slot}-title`, title: col.title })}
  <ul class="news-column__list">
${col.cards.map((c) => `    ${newsCardItem(c)}`).join('\n')}
  </ul>
</section>`;
