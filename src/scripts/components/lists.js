/**
 * LİSTE SATIRLARI — List/KAP Satırı, List/Rapor Satırı (Seans Raporu | Analiz), Footer kolonu.
 */
import { cls, icon, logoCompany } from './atoms.js';

/** List/KAP Satırı — tarih bloğu + başlık + şirket */
export const kapRow = (k) => `<li class="kap-row"><time class="date-block" datetime="${k.date}"><span class="t-body-xs-regular">${k.month}</span><span class="date-block__day t-h5-semibold">${k.day}</span></time><div class="kap-row__content"><a class="kap-row__title t-body-m-semibold" href="#">${k.title}</a><p class="kap-row__meta">${logoCompany(k.logo, 16)}<span class="kap-row__code t-body-s-semibold">${k.code}</span><span class="dot" aria-hidden="true"></span><span class="kap-row__company t-body-s-regular">${k.company}</span></p></div></li>`;

const reportMeta = (source, at = '17:59') =>
  `<p class="report-row__meta t-body-s-regular"><span>${source}</span><span class="dot" aria-hidden="true"></span><time datetime="${at}">${at}</time></p>`;

/** List/Rapor Satırı (Tip = Seans Raporu) — değişim yönü metni ve rengi belirler */
export const sessionReportRow = (r) => {
  const up = !r.change.startsWith('-');
  return `<li class="${cls('report-row', r.desktopOnly && 'report-row--desktop-only')}">${logoCompany(r.logo, 40)}<div class="report-row__content"><a class="report-row__title t-body-m-semibold" href="#">Yüzde <span class="${up ? 'is-positive' : 'is-negative'}">${r.change}</span> oranında ${up ? 'yükselişle' : 'düşüşle'} ${r.price} liradan işlem gören hissede</a>${reportMeta('Seans Raporu')}</div><span class="badge t-body-xs-semibold">${r.code}</span></li>`;
};

/** List/Rapor Satırı (Tip = Analiz) */
export const analysisReportRow = (r) => `<li class="${cls('report-row report-row--analysis', r.desktopOnly && 'report-row--desktop-only')}">${logoCompany(r.logo, 40)}<div class="report-row__content"><span class="report-row__overline t-overline">Analiz</span><a class="report-row__title t-body-m-semibold" href="#">${r.title}</a>${reportMeta(r.source)}</div>${icon('chevron-right', 'icon report-row__chevron')}</li>`;

/** Footer menü kolonu */
export const footerCol = (col) => `<div class="footer-col"><h2 class="footer-col__title t-overline">${col.title}</h2><ul class="footer-col__list t-body-s-regular">${col.links.map((l) => `<li><a href="#">${l}</a></li>`).join('')}</ul></div>`;
