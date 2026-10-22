/**
 * CANLI VERİ (opsiyonel katman)
 *
 * Ücretsiz, anahtarsız ve tarayıcıdan çağrılabilen (CORS açık) kaynaklar:
 *   - Truncgil Finans  → döviz, altın, gümüş, BIST 100   https://finans.truncgil.com/v4/today.json
 *   - Binance          → kripto fiyat + 24 saat değişim   https://api.binance.com/api/v3/ticker/24hr
 *     (yanıt vermezse yedek: CoinGecko /simple/price — oran sınırında CORS başlığı dönmediği için ikincil)
 * Her istek başarısız olursa bir kez yeniden denenir. Truncgil yanıt vermezse döviz ve altın
 * Binance paritelerinden türetilir (bkz. getFx).
 *
 * Akış: sayfa örnek veriyle (data.js) açılır → canlı veri gelirse aynı nesneler güncellenir
 * ve ekrandaki değerler yenilenir. Kaynak yanıt vermezse örnek veri kalır, hiçbir şey bozulmaz.
 * Sekme görünürken dakikada bir yenilenir.
 *
 * Ons altın: kaynak fiyatı 0 döndürdüğü için gram altın × 31,1035 ÷ USD ile türetilir.
 * Canlı veri olmayanlar (örnek veri kalır): BIST hisseleri, Brent (kaynak fiyatı 0 döndürüyor),
 * "Paramın Karşılığı" dönem getirileri (geçmiş fiyat gerektirir).
 * Prod ortamda bu dosyanın yerini kurumun kendi veri servisi alır; render fonksiyonları aynı kalır.
 */
import { currencyByCode, coins } from './data.js';
import { ICONS, CHARTS } from './core/assets.js';
import { num as fmt, signed, dir } from './core/format.js';

const TRUNCGIL = 'https://finans.truncgil.com/v4/today.json';
const COIN_IDS = { BTC: 'bitcoin', ETH: 'ethereum', XRP: 'ripple', SOL: 'solana', BNB: 'binancecoin', ADA: 'cardano', DOGE: 'dogecoin', LINK: 'chainlink' };
const COINGECKO = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COIN_IDS).join(',')}&vs_currencies=usd&include_24hr_change=true`;
const BINANCE = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(Object.keys(COIN_IDS).map((s) => `${s}USDT`)))}`;
const REFRESH_MS = 60_000;

/* Truncgil anahtarı → data.js kodu */
const FX_MAP = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', CHF: 'CHF', GRA: 'GA', CEYREKALTIN: 'CA', YARIMALTIN: 'YA', TAMALTIN: 'TA', CUMHURIYETALTINI: 'CUM', GUMUS: 'GG' };

const fetchJSON = async (url, { bust = false } = {}) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    // Önbellek URL parametresiyle aşılır (yalnız gereken kaynakta — Binance bilinmeyen parametreyi reddeder).
    // `cache: 'no-store'` kullanılmaz: Cache-Control başlığı CORS ön isteğini (OPTIONS) tetikler.
    const target = bust ? `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}` : url;
    const res = await fetch(target, { signal: ctrl.signal });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

/* Geçici ağ hatalarına karşı bir kez yeniden dener */
const getJSON = async (url, opts) => {
  try {
    return await fetchJSON(url, opts);
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return fetchJSON(url, opts);
  }
};

/* Döviz/altın: önce Truncgil; yanıt vermezse Binance'ten türetilir (aynı biçimde döner)
   USD ≈ USDT/TRY · EUR = EUR/USDT × USD · Ons = PAXG (1 ons altına endeksli) · Gram = Ons × USD ÷ 31,1035
   Yedekte gümüş, sterlin, frank ve BIST 100 yoktur; onlar örnek veride kalır. */
const BINANCE_FX = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(['USDTTRY', 'EURUSDT', 'PAXGUSDT']))}`;
const getFx = async () => {
  try {
    return await getJSON(TRUNCGIL, { bust: true });
  } catch {
    const rows = Object.fromEntries((await getJSON(BINANCE_FX)).map((r) => [r.symbol, { p: Number(r.lastPrice), c: Number(r.priceChangePercent) }]));
    const usd = rows.USDTTRY, eur = rows.EURUSDT, ons = rows.PAXGUSDT;
    return {
      USD: { Selling: usd.p, Change: +usd.c.toFixed(2) },
      EUR: { Selling: eur.p * usd.p, Change: +(eur.c + usd.c).toFixed(2) },
      GRA: { Selling: (ons.p * usd.p) / 31.1035, Change: +(ons.c + usd.c).toFixed(2) },
      ONS: { Change: +ons.c.toFixed(2) },
    };
  }
};

/* Kripto: { BTC: { usd, change } } — önce Binance, olmazsa CoinGecko */
const getCrypto = async () => {
  try {
    const rows = await getJSON(BINANCE);
    const out = {};
    rows.forEach((r) => { out[r.symbol.replace(/USDT$/, '')] = { usd: Number(r.lastPrice), change: Number(r.priceChangePercent) }; });
    return { source: 'Binance', quotes: out };
  } catch {
    const data = await getJSON(COINGECKO);
    const out = {};
    Object.entries(COIN_IDS).forEach(([sym, id]) => { if (data[id]) out[sym] = { usd: data[id].usd, change: data[id].usd_24h_change ?? 0 }; });
    return { source: 'CoinGecko', quotes: out };
  }
};

/* Ekrandaki "değer + değişim göstergesi" çiftini günceller (finans barı, Piyasa Özeti) */
function paint(el, valueText, change) {
  const d = dir(change);
  const value = el.querySelector('.ticker__value, .market-row__value > .t-h6-semibold');
  if (value) value.textContent = valueText;
  const ch = el.querySelector('.change');
  if (ch) {
    ch.className = `change change--${d}`;
    ch.querySelector('use')?.setAttribute('href', `${ICONS}#arrow-${d}`);
    ch.querySelector('.t-body-xs-semibold').textContent = signed(change);
  }
  const spark = el.querySelector('.sparkline');
  if (spark && !spark.classList.contains(`sparkline--${d}`)) {
    spark.className = `sparkline sparkline--${d}`;
    spark.querySelector('img').src = `${CHARTS}sparkline-${d}.svg`;
  }
}

/* BIST seans durumu: hafta içi 10:00–18:00 (Europe/Istanbul). Resmî tatiller dahil değildir. */
function updateMarketStatus() {
  const pill = document.querySelector('[data-market-status]');
  if (!pill) return;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map((p) => [p.type, p.value]));
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const open = !['Sat', 'Sun'].includes(parts.weekday) && minutes >= 600 && minutes < 1080;
  pill.classList.toggle('status-pill--closed', !open);
  pill.querySelector('[data-market-status-label]').textContent = open ? 'BIST Açık' : 'BIST Kapalı';
}

export function startLive({ onUpdate } = {}) {
  updateMarketStatus();
  setInterval(updateMarketStatus, 60_000);
  const byPair = Object.fromEntries(coins.map((c) => [c.pair.split('/')[0], c]));

  const apply = (fx, crypto) => {
    const quotes = {}; // data-live kodu → [değer metni, değişim]

    if (fx) {
      for (const [key, code] of Object.entries(FX_MAP)) {
        const q = fx[key];
        const price = q && (q.Selling || q.Buying);
        if (!price) continue;
        currencyByCode[code].rate = price;
        currencyByCode[code].change = q.Change ?? currencyByCode[code].change;
        quotes[code] = [fmt(price, code === 'USD' || code === 'EUR' || code === 'GBP' || code === 'CHF' ? 4 : 2), currencyByCode[code].change];
      }
      if (fx.XU100?.Selling) quotes.XU100 = [fmt(fx.XU100.Selling, 2), fx.XU100.Change ?? 0];
      // Ons: kaynak fiyatı 0 döndürüyor → gram altın ve dolardan türetilir (1 ons = 31,1035 g)
      if (fx.GRA?.Selling && fx.USD?.Selling) quotes.ONS = [`$${fmt((fx.GRA.Selling * 31.1035) / fx.USD.Selling, 2)}`, fx.ONS?.Change ?? 0];
    }

    if (crypto) {
      for (const sym of Object.keys(COIN_IDS)) {
        const q = crypto.quotes[sym];
        if (!q?.usd || !byPair[sym]) continue;
        byPair[sym].price = q.usd;
        byPair[sym].change.daily = +q.change.toFixed(2);
        quotes[sym] = [`$${fmt(q.usd, 2)}`, byPair[sym].change.daily];
      }
    }

    document.querySelectorAll('[data-live]').forEach((el) => {
      const q = quotes[el.dataset.live];
      if (!q) return;
      const current = el.querySelector('.ticker__value, .market-row__value > .t-h6-semibold')?.textContent;
      paint(el, q[0] ?? current, q[1]);
    });

    // Canlı kripto geldiyse tablo altındaki "Son güncelleme" satırı gerçek saati gösterir
    if (crypto) {
      const now = new Date();
      const stamp = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(now).replace(',', '');
      document.querySelectorAll('[data-live-updated="crypto"]').forEach((el) => {
        el.innerHTML = `Son güncelleme: <time datetime="${now.toISOString()}">${stamp}</time> · ${crypto.source}`;
      });
    }

    const updated = Object.keys(quotes).length;
    if (updated) {
      document.documentElement.dataset.live = 'on';
      onUpdate?.({ updated, at: new Date() });
    }
  };

  const load = async () => {
    const [fx, crypto] = await Promise.allSettled([getFx(), getCrypto()]);
    apply(fx.status === 'fulfilled' ? fx.value : null, crypto.status === 'fulfilled' ? crypto.value : null);
  };

  load();
  setInterval(() => { if (!document.hidden) load(); }, REFRESH_MS);
}
