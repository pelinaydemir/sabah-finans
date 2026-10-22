/**
 * Biçimlendirme yardımcıları (tr-TR) — saf fonksiyonlar, DOM'a dokunmaz.
 * Hem tarayıcı modülleri hem de derleme betiği (scripts/build.mjs) kullanır.
 */

/** 1234.5 → "1.234,50" */
export const num = (value, digits = 2) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

/** "1.234,50" / "+0,18" → 1234.5 / 0.18 */
export const parseNum = (text) => Number(String(text).replace(/\./g, '').replace(',', '.')) || 0;

/** 0.18 → "+0,18" · -0.21 → "-0,21" */
export const signed = (value, digits = 2) => `${value > 0 ? '+' : value < 0 ? '-' : ''}${num(Math.abs(value), digits)}`;

/** 1.23 → "+%1,23" */
export const percent = (value) => `${value > 0 ? '+' : value < 0 ? '-' : ''}%${num(Math.abs(value))}`;

/** Değişim yönü → BEM değiştiricisi (change--up / change--down) */
export const dir = (value) => (value < 0 ? 'down' : 'up');

/** Büyük tutarlar 100.000'den itibaren kısaltılır: 108,9 B · 1,012 Mr (4 anlamlı basamak) */
export const COMPACT_FROM = 100_000;
export const compact = (value, digits = 2) => (Math.abs(value) >= COMPACT_FROM
  ? new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumSignificantDigits: 4 }).format(value)
  : num(value, digits));

/** Arama için: büyük/küçük harf ve aksan duyarsız karşılaştırma anahtarı */
export const fold = (text) => text.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');

/** Kullanıcı girdisini HTML'e güvenle yazmak için */
export const escapeHTML = (text) => String(text).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
