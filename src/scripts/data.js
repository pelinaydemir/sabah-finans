/**
 * ÖRNEK VERİ (mock)
 * Canlı ortamda bu dosyanın yerini API yanıtları alır; alan adları ve yapı
 * backend sözleşmesi için referanstır. Bkz. HANDOFF.md › "Veri entegrasyonu".
 */

import { IMG, CUR, GOLD, CO } from './core/assets.js';

/* ---------------------------------------------------------------------------
   Manşet (Haber Kartı/Görsel Üzeri) — nav-number 1…10
   --------------------------------------------------------------------------- */
export const headlines = [
  { category: 'Dünya', time: '11 dakika önce', datetime: '2026-10-18T09:49', title: 'New York Fed imalat endeksi temmuzda beklentileri geçti', image: 'hero-ny-fed.jpg', alt: 'New York Federal Rezerv binası önünde dalgalanan ABD bayrağı', tickers: [['THYAO', '+0,18'], ['ISCTR', '-0,45']] },
  { category: 'Altın', time: '24 dakika önce', title: 'Gram altın güvenli liman talebiyle yeni zirveyi test ediyor', image: 'news-gold.jpg', alt: 'Kasada dizili külçe altınlar', tickers: [['KOZAL', '+2,14'], ['PEKGY', '+1,02']] },
  { category: 'Avrupa', time: '38 dakika önce', title: 'Avrupa Merkez Bankası faiz kararı öncesi piyasalar temkinli', image: 'news-eu.jpg', alt: 'Avrupa Komisyonu binası önünde AB bayrakları', tickers: [['GARAN', '-0,62'], ['AKBNK', '-0,38']] },
  { category: 'Borsa', time: '52 dakika önce', title: 'BIST 100 endeksi bankacılık satışlarıyla günü ekside kapattı', image: 'news-market.jpg', alt: 'Düşüşü gösteren kırmızı borsa grafiği', tickers: [['YKBNK', '-1,24'], ['ISCTR', '-0,45']] },
  { category: 'Ekonomi', time: '1 saat önce', title: 'Merkez Bankası rezervleri haftalık bazda 2,1 milyar dolar arttı', image: 'hero-ny-fed.jpg', alt: 'New York Federal Rezerv binası', tickers: [['THYAO', '+0,18'], ['ASELS', '+0,92']] },
  { category: 'Emtia', time: '1 saat önce', title: 'Brent petrol arz endişeleriyle 70 doların üzerine çıktı', image: 'news-market.jpg', alt: 'Borsa ekranları', tickers: [['TUPRS', '+1,47'], ['PETKM', '+0,66']] },
  { category: 'Şirket', time: '2 saat önce', title: 'Havacılık hisseleri yaz sezonu yolcu verileriyle pozitif ayrıştı', image: 'news-eu.jpg', alt: 'AB bayrakları', tickers: [['THYAO', '+2,05'], ['PGSUS', '+1,80']] },
  { category: 'Kripto', time: '2 saat önce', title: 'Bitcoin ETF girişleri haftalık bazda rekor seviyeye ulaştı', image: 'news-gold.jpg', alt: 'Külçe altınlar', tickers: [['BTC', '+3,12'], ['ETH', '+1,94']] },
  { category: 'Dünya', time: '3 saat önce', title: 'Asya piyasaları ABD faiz kararını beklerken karışık seyretti', image: 'hero-ny-fed.jpg', alt: 'ABD bayrağı', tickers: [['THYAO', '+0,18'], ['ISCTR', '-0,45']] },
  { category: 'KAP', time: '3 saat önce', title: 'Aselsan yeni savunma sözleşmesini KAP’a bildirdi', image: 'news-market.jpg', alt: 'Borsa ekranları', tickers: [['ASELS', '+4,21'], ['KONTR', '+1,10']] },
].map((h) => ({ ...h, image: IMG + h.image }));

/* ---------------------------------------------------------------------------
   Döviz & Altın — TRY karşılığı (1 birim = x TRY), Dropdown/Para Birimi grupları
   --------------------------------------------------------------------------- */
export const currencies = [
  { code: 'USD', name: 'ABD Doları', group: 'popular', logo: CUR + 'usd.svg', rate: 41.5612, change: 0.18 },
  { code: 'EUR', name: 'Euro', group: 'popular', logo: CUR + 'eur.svg', rate: 48.2140, change: -0.21 },
  { code: 'GA', name: 'Gram Altın', label: 'Gram Altın', group: 'popular', logo: GOLD + 'gram.svg', rate: 4215.60, change: 1.23 },
  { code: 'CA', name: 'Çeyrek Altın', label: 'Çeyrek Altın', group: 'popular', logo: GOLD + 'ceyrek.svg', rate: 6890.40, change: 1.18 },
  { code: 'TRY', name: 'Türk Lirası', group: 'fx', logo: CUR + 'try.svg', rate: 1, change: 0 },
  { code: 'GBP', name: 'İngiliz Sterlini', group: 'fx', logo: CUR + 'gbp.svg', rate: 55.3405, change: 0.09 },
  { code: 'CHF', name: 'İsviçre Frangı', group: 'fx', logo: CUR + 'chf.svg', rate: 51.8720, change: -0.11 },
  { code: 'YA', name: 'Yarım Altın', label: 'Yarım Altın', group: 'gold', logo: GOLD + 'yarim.svg', rate: 13780.80, change: 1.18 },
  { code: 'TA', name: 'Tam Altın', label: 'Tam Altın', group: 'gold', logo: GOLD + 'tam.svg', rate: 27450.10, change: 1.15 },
  { code: 'CUM', name: 'Cumhuriyet Altını', label: 'Cumhuriyet Altını', group: 'gold', logo: GOLD + 'cumhuriyet.svg', rate: 28120.00, change: 1.12 },
  { code: 'ONS', name: 'Ons Altın', label: 'Ons Altın', group: 'gold', logo: GOLD + 'ons.svg', rate: 110137.0, change: 0.94 },
  { code: 'GG', name: 'Gram Gümüş', label: 'Gram Gümüş', group: 'gold', logo: GOLD + 'gumus.svg', rate: 52.40, change: -0.82 },
];

/** Koda göre hızlı erişim — canlı veri aynı nesneleri günceller */
export const currencyByCode = Object.fromEntries(currencies.map((c) => [c.code, c]));

export const currencyGroups = [
  { id: 'popular', label: 'Popüler' },
  { id: 'fx', label: 'Döviz' },
  { id: 'gold', label: 'Altın' },
];

/* "Paramın Karşılığı" için başlangıç para birimleri (Dropdown/Para Birimi – Kompakt) */
export const baseCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'CHF'];

/* ---------------------------------------------------------------------------
   Paramın Karşılığı Ne Olurdu? — dönem getirileri (%)
   --------------------------------------------------------------------------- */
export const moneyAssets = [
  { name: 'Altın', logo: CUR + 'gold.svg', returns: { daily: 1.23, weekly: 3.84, monthly: 6.12, yearly: 41.7 } },
  { name: 'Dolar', logo: CUR + 'usd.svg', returns: { daily: 0.56, weekly: 1.12, monthly: 2.48, yearly: 21.3 } },
  { name: 'Euro', logo: CUR + 'eur.svg', returns: { daily: -0.82, weekly: 0.64, monthly: 1.95, yearly: 24.8 } },
  { name: 'BIST 100', logo: CUR + 'bist100.png', returns: { daily: 0.34, weekly: -1.48, monthly: 3.06, yearly: 18.9 } },
];

/* ---------------------------------------------------------------------------
   BIST Öne Çıkanlar — tab başına 6 hisse
   --------------------------------------------------------------------------- */
const tile = (code, logo, change, price, extra = {}) => ({ code, logo: CO + logo, change, price, ...extra });

export const bistLists = {
  up: [
    tile('CELHA', 'celha.png', 7.15, '8,76', { bordered: true }),
    tile('HUBVC', 'hubvc.png', 5.88, '156,30'),
    tile('KOZAL', 'kozal.svg', 4.52, '289,40'),
    tile('PEKGY', 'pekgy.png', 3.24, '42,58'),
    tile('ENKAI', 'enkai.svg', 2.97, '53,15'),
    tile('ASELS', 'asels.svg', 2.41, '148,20'),
  ],
  down: [
    tile('EREGL', 'eregl.svg', -9.98, '13,53'),
    tile('MNDTR', 'mndtr.svg', -2.35, '8,72'),
    tile('YKBNK', 'ykbnk.svg', -1.24, '32,18'),
    tile('GARAN', 'garan.svg', -0.62, '128,40'),
    tile('AKBNK', 'akbnk.svg', -0.38, '68,95'),
    tile('SASA', 'sasa.svg', -0.21, '4,12'),
  ],
  active: [
    tile('THYAO', 'thyao.svg', 0.18, '312,50', { volume: '4,2 Mr ₺' }),
    tile('ASELS', 'asels.svg', 2.41, '148,20', { volume: '3,8 Mr ₺' }),
    tile('GARAN', 'garan.svg', -0.62, '128,40', { volume: '3,1 Mr ₺' }),
    tile('YKBNK', 'ykbnk.svg', -1.24, '32,18', { volume: '2,7 Mr ₺' }),
    tile('BIMAS', 'bimas.svg', 0.84, '548,00', { volume: '2,2 Mr ₺' }),
    tile('KOZAL', 'kozal.svg', 4.52, '289,40', { volume: '1,9 Mr ₺' }),
  ],
};

/* ---------------------------------------------------------------------------
   Kripto Paralar — dönem başına fiyat aralığı ve değişim
   --------------------------------------------------------------------------- */
export const cryptoPeriods = {
  daily: { range: 0.016, label: 'günlük' },
  weekly: { range: 0.06, label: 'haftalık' },
  monthly: { range: 0.14, label: 'aylık' },
  yearly: { range: 0.62, label: 'yıllık' },
};

/* Kripto logoları: Figma Logo/Currency + cryptocurrency-icons (CC0, spothq/cryptocurrency-icons) */
export const coins = [
  { pair: 'BTC/USDT', name: 'Bitcoin', logo: CUR + 'btc.svg', price: 78439.61, change: { daily: -1.54, weekly: 3.12, monthly: 8.45, yearly: 64.2 }, decimals: 2 },
  { pair: 'ETH/USDT', name: 'Ethereum', logo: CUR + 'eth.svg', price: 2474.67, change: { daily: -1.03, weekly: 1.94, monthly: -4.36, yearly: 12.8 }, decimals: 2 },
  { pair: 'XRP/USDT', name: 'Ripple', logo: CUR + 'xrp.svg', price: 2.3412, change: { daily: -1.12, weekly: -3.48, monthly: 11.2, yearly: 188.4 }, decimals: 4 },
  { pair: 'SOL/USDT', name: 'Solana', logo: CUR + 'sol.svg', price: 182.45, change: { daily: -0.84, weekly: 4.65, monthly: 15.9, yearly: 92.1 }, decimals: 2 },
  { pair: 'BNB/USDT', name: 'Binance Coin', logo: CUR + 'bnb.svg', price: 612.3, change: { daily: 0.42, weekly: 2.08, monthly: 5.31, yearly: 38.6 }, decimals: 2 },
  { pair: 'ADA/USDT', name: 'Cardano', logo: CUR + 'ada.svg', price: 0.7421, change: { daily: 0.65, weekly: -2.16, monthly: -7.84, yearly: 41.3 }, decimals: 4 },
  { pair: 'DOGE/USDT', name: 'Dogecoin', logo: CUR + 'doge.svg', price: 0.2214, change: { daily: -1.87, weekly: -5.42, monthly: 9.18, yearly: 112.6 }, decimals: 4 },
  { pair: 'LINK/USDT', name: 'Chainlink', logo: CUR + 'link.svg', price: 16.82, change: { daily: 0.93, weekly: 6.24, monthly: 12.7, yearly: 54.9 }, decimals: 2 },
];

/* ---------------------------------------------------------------------------
   Arama — hisse/endeks sembolleri ve "En Çok Arananlar"
   Döviz, altın ve kripto sonuçları yukarıdaki `currencies` ve `coins` listelerinden
   üretilir (bkz. features/search.js › buildSearchIndex). Canlı ortamda: GET /search?q=
   --------------------------------------------------------------------------- */
export const stocks = [
  { code: 'THYAO', name: 'Türk Hava Yolları A.O.', logo: CO + 'thyao.svg', change: 0.18 },
  { code: 'ASELS', name: 'Aselsan Elektronik Sanayi ve Ticaret A.Ş.', logo: CO + 'asels.svg', change: 2.41 },
  { code: 'GARAN', name: 'Türkiye Garanti Bankası A.Ş.', logo: CO + 'garan.svg', change: -0.62 },
  { code: 'AKBNK', name: 'Akbank T.A.Ş.', logo: CO + 'akbnk.svg', change: -0.38 },
  { code: 'YKBNK', name: 'Yapı ve Kredi Bankası A.Ş.', logo: CO + 'ykbnk.svg', change: -1.24 },
  { code: 'EREGL', name: 'Ereğli Demir ve Çelik Fabrikaları T.A.Ş.', logo: CO + 'eregl.svg', change: -9.98 },
  { code: 'BIMAS', name: 'BİM Birleşik Mağazalar A.Ş.', logo: CO + 'bimas.svg', change: 0.84 },
  { code: 'KOZAL', name: 'Koza Altın İşletmeleri A.Ş.', logo: CO + 'kozal.svg', change: 4.52 },
  { code: 'SASA', name: 'Sasa Polyester Sanayi A.Ş.', logo: CO + 'sasa.svg', change: -0.21 },
  { code: 'ENKAI', name: 'Enka İnşaat ve Sanayi A.Ş.', logo: CO + 'enkai.svg', change: 2.97 },
  { code: 'PEKGY', name: 'Peker Gayrimenkul Yatırım Ortaklığı A.Ş.', logo: CO + 'pekgy.png', change: 3.24 },
  { code: 'CELHA', name: 'Çelik Halat ve Tel Sanayii A.Ş.', logo: CO + 'celha.png', change: 7.15 },
  { code: 'HUBVC', name: 'Hub Girişim Sermayesi Yatırım Ortaklığı A.Ş.', logo: CO + 'hubvc.png', change: 5.88 },
  { code: 'MNDTR', name: 'Mondi Turkey Oluklu Mukavva Kağıt ve Ambalaj Sanayi A.Ş.', logo: CO + 'mndtr.svg', change: -2.35 },
  { code: 'KONKA', name: 'Konya Kağıt Sanayi ve Ticaret A.Ş.', logo: CO + 'konka.svg', change: 1.06 },
  { code: 'PSGYO', name: 'Pasifik Gayrimenkul Yatırım Ortaklığı A.Ş.', logo: CO + 'psgyo.svg', change: -0.94 },
  { code: 'XU100', name: 'BIST 100 Endeksi', type: 'Endeks', logo: CUR + 'bist100.png', change: 0.34 },
];

/* Varsayılan durumda listelenen semboller (sıra = popülerlik) */
export const popularSearches = ['THYAO', 'USD', 'GA', 'ASELS', 'BTC', 'XU100', 'EUR', 'GARAN'];

/* ---------------------------------------------------------------------------
   Piyasa genişliği ve istatistikler — BIST Öne Çıkanlar alt satırı, Hisse İstatistikleri
   --------------------------------------------------------------------------- */
export const bistBreadth = { up: 149, down: 444, updatedAt: '2026-10-16T17:59' };
export const stockStats = {
  up: 69, flat: 10, down: 552,
  volumeTry: '152.015.139.268,00', volumeLot: '9.899.001.370',
  updatedAt: '2026-10-16T17:59',
};
/* Kripto tablosu ilk görünüm zamanı — canlı veri gelince live.js gerçek saatle değiştirir */
export const cryptoUpdatedAt = '2026-02-18T16:11';
