/**
 * İÇERİK (editoryal, örnek) — sayfadaki tekrar eden listelerin tek kaynağı
 * Her dizi bir Figma component'inin örnek verisidir; markup components/ altındaki
 * şablonlardan üretilir (bkz. scripts/build.mjs). Piyasa verisi: data.js.
 * Canlı ortamda bu dosyanın yerini CMS / haber API'si alır; alan adları sözleşme niteliğindedir.
 */

import { IMG, CUR, CO } from './core/assets.js';

const img = (file, width, height) => ({ src: IMG + file, width, height });
/* Örnek yayın zamanı (<time datetime>) — canlıda her haberin kendi zamanı gelir */
const cards = (list) => list.map((card) => ({ datetime: '2026-10-18T09:49', ...card }));

/* Layout/Son Dakika Akışı */
export const breakingNews = [
  "Emtia fiyatları arz endişeleriyle yükselişini sürdürüyor",
  "Asya piyasaları ABD faiz kararını beklerken karışık seyretti",
  "Altın fiyatları güçlü dolar karşısında geriledi, yatırımcılar temkinli",
  "Borsa İstanbul güne yükselişle başladı, BIST 100 yeni rekor kırdı",
];

/* Layout/Finans Barı › Finance/Ticker — data-live kodu canlı veri eşlemesidir (live.js) */
export const marketBar = [
  { code: "USD", name: "Dolar", value: "41,5612", change: "+0,18" },
  { code: "EUR", name: "Euro", value: "48,2140", change: "-0,21" },
  { code: "GBP", name: "Sterlin", value: "55,3405", change: "+0,09" },
  { code: "GA", name: "Gram Altın", value: "4.215,60", change: "+1,23" },
  { code: "XU100", name: "BIST 100", value: "10.842,35", change: "+0,34" },
  { code: "BTC", name: "Bitcoin", value: "$78.439,61", change: "-1,54" },
  { code: "ETH", name: "Ethereum", value: "$2.474,67", change: "-1,03" },
  { code: "GG", name: "Gram Gümüş", value: "52,40", change: "-0,82" },
  { code: "CHF", name: "İsviçre Frangı", value: "51,8720", change: "-0,11" },
  { code: "ONS", name: "Ons Altın", value: "$3.312,40", change: "+0,94" },
  { code: "BRENT", name: "Brent Petrol", value: "$70,84", change: "+1,12" },
];

/* Kategori navigasyonu › Navigation/Tab (Boyut = Büyük) — ilki seçili */
export const categories = [
  "Tüm Haberler", "Gündem", "Ekonomi", "Borsa", "Döviz/Emtia", "Altın", "Gümüş", "Kripto Para", "KAP",
];

/* Manşet yan listesi › Card/Haber (Görsel = Yok) — extra: yalnız desktop */
export const topStories = cards([
  { title: "Borsa İstanbul güne yükselişle başladı, BIST 100 rekor tazeledi", category: "Borsa", time: "8 dakika önce", ticker: ["XU100", "+0,34"] },
  { title: "Bankacılık endeksinde kâr satışları derinleşiyor", category: "Borsa", time: "19 dakika önce", ticker: ["ISCTR", "-0,45"] },
  { title: "THY, ekim ayı yolcu verilerini açıkladı", category: "Şirket", time: "27 dakika önce", ticker: ["THYAO", "+0,18"] },
  { title: "Brent petrolde arz endişesi fiyatları destekliyor", category: "Emtia", time: "41 dakika önce", ticker: ["TUPRS", "+1,47"], extra: true },
  { title: "Merkez Bankası rezervleri haftalık bazda arttı", category: "Ekonomi", time: "1 saat önce", ticker: ["AKBNK", "-0,38"], extra: true },
]);

/* Haber kolonları › Section/Başlık + Card/Haber (ilk kart görselli) */
export const newsColumns = [
  {
    slot: "gundem",
    title: "Gündem Haberleri",
    cards: cards([
      { title: "Enflasyon beklentisi anketinde yıl sonu tahmini geriledi", category: "Ekonomi", time: "1 saat önce", ticker: ["GARAN", "-0,62"], image: img("news-gold.jpg", 1200, 800) },
      { title: "Konut satışları eylülde yıllık bazda yüzde 12 arttı", category: "Ekonomi", time: "2 saat önce", ticker: ["EKGYO", "+1,12"] },
      { title: "Avrupa borsaları enflasyon verileriyle yükselişe geçti", category: "Dünya", time: "2 saat önce", ticker: ["ASELS", "+2,41"] },
    ]),
  },
  {
    slot: "sirket",
    title: "Şirket Haberleri",
    cards: cards([
      { title: "Aselsan’dan 180 milyon dolarlık yeni ihracat sözleşmesi", category: "Şirket", time: "35 dakika önce", ticker: ["ASELS", "+2,41"], image: img("news-eu.jpg", 1200, 794) },
      { title: "BİM üçüncü çeyrek finansal sonuçlarını paylaştı", category: "Şirket", time: "1 saat önce", ticker: ["BIMAS", "+0,84"] },
      { title: "Ereğli Demir Çelik’te yatırım planı güncellendi", category: "Şirket", time: "3 saat önce", ticker: ["EREGL", "-9,98"] },
    ]),
  },
  {
    slot: "kap-haber",
    title: "KAP Haberleri",
    cards: cards([
      { title: "Koza Altın’dan maden ruhsatı açıklaması", category: "KAP", time: "14 dakika önce", ticker: ["KOZAL", "+4,52"], image: img("news-market.jpg", 1200, 800) },
      { title: "Sasa Polyester yatırım teşvik belgesi aldı", category: "KAP", time: "52 dakika önce", ticker: ["SASA", "-0,21"] },
      { title: "Yapı Kredi kredi derecelendirme notunu duyurdu", category: "KAP", time: "2 saat önce", ticker: ["YKBNK", "-1,24"] },
    ]),
  },
];

/* Kripto Haberleri › Card/Haber (Görsel = Var) */
export const cryptoNews = cards([
  { title: "Bitcoin ETF girişleri haftalık bazda rekor seviyeye ulaştı", category: "Kripto", time: "2 saat önce", ticker: ["BTC", "-1,54"], image: img("news-gold.jpg", 1200, 800) },
  { title: "Ethereum’da ağ güncellemesi öncesi işlem hacmi arttı", category: "Kripto", time: "3 saat önce", ticker: ["ETH", "-1,03"], image: img("news-eu.jpg", 1200, 794) },
  { title: "Dogecoin hafta başında yüzde 9 değer kazandı", category: "Kripto", time: "4 saat önce", ticker: ["DOGE", "+9,18"], image: img("news-market.jpg", 1200, 800) },
]);

/* Widget/Piyasa Özeti › satırlar */
export const marketSummary = [
  { code: "USD", name: "Dolar", logo: CUR + "usd.svg", value: "41,5612", change: "+0,18" },
  { code: "EUR", name: "Euro", logo: CUR + "eur.svg", value: "48,2140", change: "-0,21" },
  { code: "GA", name: "Altın", logo: CUR + "gold.svg", value: "4.215,60", change: "+1,23" },
  { code: "GG", name: "Gümüş", logo: CUR + "silver.svg", value: "52,40", change: "-0,82" },
];

/* Widget/KAP Duyuruları › List/KAP Satırı — [birinci kolon, ikinci kolon (mobilde gizli)] */
export const kapAnnouncements = [
  [
    { date: "2026-02-16", month: "Şubat", day: "16", title: "Özel Durum Açıklaması", logo: CO + "thyao.svg", code: "THYAO", company: "Türk Hava Yolları A.O." },
    { date: "2026-02-15", month: "Şubat", day: "15", title: "Sermaye Artırımı Kararı", logo: CO + "akbnk.svg", code: "AKBNK", company: "Akbank T.A.Ş." },
    { date: "2026-02-14", month: "Şubat", day: "14", title: "Temettü Dağıtım Kararı", logo: CO + "eregl.svg", code: "EREGL", company: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş." },
    { date: "2026-02-13", month: "Şubat", day: "13", title: "Yeni Savunma Sözleşmesi", logo: CO + "asels.svg", code: "ASELS", company: "Aselsan Elektronik Sanayi ve Ticaret A.Ş." },
    { date: "2026-02-12", month: "Şubat", day: "12", title: "Yatırım Teşvik Belgesi", logo: CO + "sasa.svg", code: "SASA", company: "Sasa Polyester Sanayi A.Ş." },
  ],
  [
    { date: "2026-01-28", month: "Ocak", day: "28", title: "Yıllık Finansal Rapor Özeti", logo: CO + "bimas.svg", code: "BIMAS", company: "BİM Birleşik Mağazalar A.Ş." },
    { date: "2026-01-25", month: "Ocak", day: "25", title: "Kredi Derecelendirme Notu", logo: CO + "ykbnk.svg", code: "YKBNK", company: "Yapı ve Kredi Bankası A.Ş." },
    { date: "2026-01-22", month: "Ocak", day: "22", title: "Yönetim Kurulu Üye Değişikliği", logo: CO + "garan.svg", code: "GARAN", company: "Türkiye Garanti Bankası A.Ş." },
    { date: "2026-01-18", month: "Ocak", day: "18", title: "Maden Ruhsatı Güncellemesi", logo: CO + "kozal.svg", code: "KOZAL", company: "Koza Altın İşletmeleri A.Ş." },
    { date: "2026-01-15", month: "Ocak", day: "15", title: "Uluslararası Proje İhalesi", logo: CO + "enkai.svg", code: "ENKAI", company: "Enka İnşaat ve Sanayi A.Ş." },
  ],
];

/* Widget/Seans Raporu › List/Rapor Satırı (Tip = Seans Raporu) */
export const sessionReports = [
  { code: "EREGL", logo: CO + "eregl.svg", change: "-9,98", price: "13,53" },
  { code: "MNDTR", logo: CO + "mndtr.svg", change: "-2,35", price: "8,72" },
  { code: "PSGYO", logo: CO + "psgyo.svg", change: "+9,96", price: "4,53" },
  { code: "KONKA", logo: CO + "konka.svg", change: "+4,12", price: "21,40", desktopOnly: true },
];

/* Widget/Raporlar ve Analizler › List/Rapor Satırı (Tip = Analiz) */
export const analysisReports = [
  { title: "Haftalık Bülten", source: "Bizim Menkul", logo: CO + "eregl.svg" },
  { title: "Akşam Bülteni", source: "İKON Menkul", logo: CO + "konka.svg" },
  { title: "Petrol Fiyatları – Brent", source: "İKON Menkul", logo: CO + "mndtr.svg" },
  { title: "Uluslararası Piyasalar – Eurotahvil", source: "İş Yatırım", logo: CO + "psgyo.svg", desktopOnly: true },
];

/* Layout/Footer › menü kolonları */
export const footerMenu = [
  { title: "Döviz", links: ["Dolar", "Euro", "Sterlin", "Frank", "Kanada Doları", "Riyal", "Yen", "Pariteler", "Merkez Bankası Kurları"] },
  { title: "Altın", links: ["Altın Fiyatları", "Gram Altın", "Çeyrek Altın", "Yarım Altın", "Cumhuriyet Altını", "Ons Altın", "22 Ayar Bilezik", "Gümüş Fiyatı"] },
  { title: "Borsa", links: ["Canlı Borsa", "Hisse Fiyatları", "Endeksler", "En Çok Yükselenler", "En Yüksek Hacim", "Geçmiş Kapanışlar", "KAP Haberleri", "Günün Özeti", "Dünya Borsa Endeksleri"] },
  { title: "Kripto ve Araçlar", links: ["Kripto Paralar", "Bitcoin", "Ethereum", "Ripple", "Teknik Analiz", "Mali Tablolar", "Tahvil Bono Repo", "VİOP / Varant", "Maaş Hesaplama", "Terimler Sözlüğü"] },
];

/* Navigation/Tab (Boyut = Küçük) setleri — [data-tab değeri, etiket]; ilki seçili */
export const tabSets = {
  period: [["daily", "Günlük"], ["weekly", "Haftalık"], ["monthly", "Aylık"], ["yearly", "Yıllık"]],
  bist: [["up", "Yükselen"], ["down", "Düşen"], ["active", "En Aktif"]],
};
