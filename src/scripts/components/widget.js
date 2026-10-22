/**
 * WIDGET KABUĞU — başlık, "son güncelleme" satırı, oran çubuğu, piyasa genişliği,
 * istatistik listesi ve kampanya (reklam) yer tutucusu.
 */
import { num, dateTime } from '../core/format.js';
import { attr, cls, icon } from './atoms.js';
import { CAMPAIGN } from '../core/assets.js';

/** Widget başlığı — link: başlık bağlantılı (ok ikonlu) · extra: sağdaki öğe (ör. seans rozeti) */
export const widgetHeader = ({ id, title, link = false, extra = '' }) => (link
  ? `<header class="widget__header widget__header--link"><h2 id="${id}"><a class="widget__title-link widget__title" href="#">${title}${icon('arrow-right')}</a></h2></header>`
  : `<header class="widget__header"><h2 class="widget__title" id="${id}">${title}</h2>${extra}</header>`);

/** Chip/Seans Durumu — metin ve durum live.js'te güncellenir */
export const marketStatus = () =>
  '<span class="status-pill t-body-s-medium" data-market-status><span class="status-pill__dot" aria-hidden="true"></span><span data-market-status-label>BIST Açık</span></span>';

/** "Son güncelleme: 16.10.2026 17:59 · not" — metin kısmı (live.js de kullanır) */
export const lastUpdateLabel = (at, note) =>
  `Son güncelleme: <time datetime="${at instanceof Date ? at.toISOString() : at}">${dateTime(at)}</time>${note ? ` · ${note}` : ''}`;

/** Son güncelleme satırı — live: canlı veri bu satırı günceller (data-live-updated) */
export const lastUpdate = ({ at, note, live, className }) =>
  `<p class="${cls('last-update', className, 't-body-xs-regular')}">${icon('clock')}<span${attr('data-live-updated', live)}>${lastUpdateLabel(at, note)}</span></p>`;

/** Oran çubuğu — segment genişliği değerle orantılı (flat: sabit genişlikli ara parça) */
const ratioBar = (segments, { label, large = false }) =>
  `<div class="${cls('ratio-bar', large && 'ratio-bar--lg')}" role="img" aria-label="${label}">${segments.map(([type, value]) =>
    `<span class="ratio-bar__segment ratio-bar__segment--${type}"${type === 'flat' ? '' : ` style="--value: ${value}"`}></span>`).join('')}</div>`;

const share = (part, total) => (part / total) * 100;

/** BIST Öne Çıkanlar › yükselen / düşen dağılımı */
export const bistBreadth = ({ up, down }) => {
  const total = up + down;
  const [pUp, pDown] = [share(up, total), share(down, total)];
  return `<div class="breadth">
  <p class="breadth__counts">
    <span><span class="t-h6-semibold is-positive">${up}</span> <span class="t-body-s-regular">Yükselen</span></span>
    <span><span class="t-body-s-regular">Düşen</span> <span class="t-h6-semibold is-negative">${down}</span></span>
  </p>
  ${ratioBar([['up', Math.round(pUp * 10)], ['down', Math.round(pDown * 10)]], { label: `Yükselen %${num(pUp, 1)}, düşen %${num(pDown, 1)}` })}
  <p class="breadth__percent t-body-xs-semibold"><span class="is-positive">%${num(pUp, 1)}</span><span class="is-negative">%${num(pDown, 1)}</span></p>
</div>`;
};

const legendItem = (type, label, value, modifier, tone) =>
  `<div class="${cls('legend__item', modifier && `legend__item--${modifier}`)}"><dt class="legend__label t-body-xs-regular"><span class="legend__dot legend__dot--${type}" aria-hidden="true"></span>${label}</dt><dd class="${cls('t-h5-semibold', tone)}">${value}</dd></div>`;

/** Hisse İstatistikleri › başlık + dağılım çubuğu + lejant */
export const stockBreadth = ({ up, flat, down }) => {
  const total = up + flat + down;
  return `<div class="breadth breadth--roomy">
  <p class="breadth__headline t-h4-semibold">Hisselerin <span class="is-negative">%${Math.round(share(down, total))}’si düşüşte</span></p>
  ${ratioBar([['up', up], ['flat'], ['down', down]], { label: `${up} yükselen, ${flat} değişmeyen, ${down} düşen`, large: true })}
  <dl class="legend">
    ${legendItem('up', 'Yükselen', up, '', 'is-positive')}
    ${legendItem('flat', 'Değişmeyen', flat, 'center')}
    ${legendItem('down', 'Düşen', down, 'end', 'is-negative')}
  </dl>
</div>`;
};

/** Hisse İstatistikleri › işlem satırları */
export const statsList = ({ up, flat, down, volumeTry, volumeLot }) => `<dl class="stats">
${[['İşlem gören hisse', up + flat + down], ['İşlem hacmi (₺)', volumeTry], ['İşlem hacmi (lot)', volumeLot]]
    .map(([label, value]) => `  <div class="stats__row"><dt class="t-body-s-regular">${label}</dt><dd class="t-numeric-m-semibold">${value}</dd></div>`).join('\n')}
</dl>`;

/* Kampanya ölçüleri (IAB): inline = leaderboard 728×90 · side = medium rectangle 300×256 */
const CAMPAIGN_SIZES = { inline: ['leaderboard.jpg', 728, 90], side: ['rectangle.jpg', 300, 256] };

/** Kampanya yer tutucusu — ad server slot'u ile değiştirilir */
export const campaignSlot = ({ type, slot }) => {
  const [file, width, height] = CAMPAIGN_SIZES[type];
  return `<div class="campaign-${type}" data-slot="${slot}">
  <a href="#"><img src="${CAMPAIGN}${file}" width="${width}" height="${height}" alt="Kampanya görseli" loading="lazy"></a>
</div>`;
};
