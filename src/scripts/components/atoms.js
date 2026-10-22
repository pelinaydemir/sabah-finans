/**
 * ATOMLAR — Figma kütüphanesindeki temel component'ların HTML karşılıkları.
 * Hepsi saf fonksiyondur (string döner); hem tarayıcıda hem derleme betiğinde çalışır.
 */
import { ICONS, CHARTS } from '../core/assets.js';
import { dir } from '../core/format.js';

const attr = (name, value) => (value === undefined || value === false ? '' : ` ${name}="${value}"`);
const cls = (...names) => names.filter(Boolean).join(' ');

/** Icon — sprite'tan sembol */
export const icon = (id, className = 'icon') => `<svg class="${className}" aria-hidden="true"><use href="${ICONS}#${id}"/></svg>`;

/** Finance/Change Indicator — ok + değişim metni; yön `value` işaretinden gelir */
export const changeIndicator = (text, value = parseFloat(String(text).replace(/[^\d,-]/g, '').replace(',', '.'))) => {
  const d = dir(value);
  return `<span class="change change--${d}"><span class="change__icon"><svg aria-hidden="true"><use href="${ICONS}#arrow-${d}"/></svg></span><span class="t-body-xs-semibold">${text}</span></span>`;
};

/** Finance/Ticker Chip — [sembol, "+0,18"] */
export const tickerChip = ([symbol, change], { solid = false } = {}) =>
  `<a class="${cls('ticker-chip', solid && 'ticker-chip--solid')}" href="#"><span class="ticker-chip__symbol">${symbol}</span>${changeIndicator(change)}</a>`;

/** Finance/Sparkline — yöne göre örnek çizgi */
export const sparkline = (direction, { hidden = false } = {}) =>
  `<span class="sparkline sparkline--${direction}"${attr('aria-hidden', hidden && 'true')}><img src="${CHARTS}sparkline-${direction}.svg" alt=""></span>`;

/** Logo/Currency — dairesel para birimi logosu */
export const logoCurrency = (src, size) => `<span class="logo-currency logo-currency--${size}"><img src="${src}" alt=""></span>`;

/** Logo/Company — şirket logosu */
export const logoCompany = (src, size, { bordered = false, className } = {}) =>
  `<img class="${cls(className, 'logo-company', `logo-company--${size}`, bordered && 'logo-company--bordered')}" src="${src}" alt="">`;

/** Logo yoksa harfli avatar (kripto) */
export const coinLogo = (item, size = 32) => (item.logo
  ? logoCurrency(item.logo, size)
  : `<span class="coin-avatar t-body-xs-semibold" style="--coin-color: ${item.avatar[1]}" aria-hidden="true">${item.avatar[0]}</span>`);

/** Navigation/Tab (Boyut = Küçük) — role="tab" düğmeleri; ilki seçili */
export const tabs = (set) => set.map(([value, label], i) =>
  `<button class="${cls('tab tab--sm', i === 0 && 'is-selected')}" type="button" role="tab" data-tab="${value}" aria-selected="${i === 0}"${attr('tabindex', i > 0 && '-1')}><span class="tab__label">${label}</span></button>`);

/** Navigation/Tab (Boyut = Büyük) — bağlantı; ilki seçili sayfa */
export const categoryTabs = (labels) => labels.map((label, i) =>
  `<li><a class="${cls('tab tab--lg', i === 0 && 'is-selected')}" href="#"${attr('aria-current', i === 0 && 'page')}><span class="tab__label">${label}</span></a></li>`);

/** Section/Başlık — bağlantılı bölüm başlığı */
export const sectionTitle = ({ id, title }) =>
  `<h2 class="section-title" id="${id}"><a href="#"><span class="t-h3-bold">${title}</span>${icon('arrow-right')}</a></h2>`;

export { attr, cls };
