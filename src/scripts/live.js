/**
 * CANLI VERİ (opsiyonel katman)
 *
 * Ücretsiz, anahtarsız ve tarayıcıdan çağrılabilen (CORS açık) iki kaynak:
 *   - Truncgil Finans  → döviz, altın, gümüş, BIST 100   https://finans.truncgil.com/v4/today.json
 *   - CoinGecko        → kripto fiyat + 24 saat değişim   https://api.coingecko.com/api/v3/simple/price
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
import { currencies, coins } from './data.js';

const TRUNCGIL = 'https://finans.truncgil.com/v4/today.json';
const COIN_IDS = { BTC: 'bitcoin', ETH: 'ethereum', XRP: 'ripple', SOL: 'solana', BNB: 'binancecoin', ADA: 'cardano', DOGE: 'dogecoin', LINK: 'chainlink' };
const COINGECKO = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COIN_IDS).join(',')}&vs_currencies=usd&include_24hr_change=true`;
const REFRESH_MS = 60_000;
const ICONS = 'src/assets/icons/sprite.svg';

/* Truncgil anahtarı → data.js kodu */
const FX_MAP = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', CHF: 'CHF', GRA: 'GA', CEYREKALTIN: 'CA', YARIMALTIN: 'YA', TAMALTIN: 'TA', CUMHURIYETALTINI: 'CUM', GUMUS: 'GG' };

const fmt = (value, digits) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const signed = (value) => `${value > 0 ? '+' : value < 0 ? '-' : ''}${fmt(Math.abs(value), 2)}`;

const getJSON = async (url) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

/* Ekrandaki "değer + değişim göstergesi" çiftini günceller (finans barı, Piyasa Özeti) */
function paint(el, valueText, change) {
  const dir = change < 0 ? 'down' : 'up';
  const value = el.querySelector('.ticker__value, .market-row__value > .t-h6-semibold');
  if (value) value.textContent = valueText;
  const ch = el.querySelector('.change');
  if (ch) {
    ch.className = `change change--${dir}`;
    ch.querySelector('use')?.setAttribute('href', `${ICONS}#arrow-${dir}`);
    ch.querySelector('.t-body-xs-semibold').textContent = signed(change);
  }
  const spark = el.querySelector('.sparkline');
  if (spark && !spark.classList.contains(`sparkline--${dir}`)) {
    spark.className = `sparkline sparkline--${dir}`;
    spark.querySelector('img').src = `src/assets/charts/sparkline-${dir}.svg`;
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
  const byCode = Object.fromEntries(currencies.map((c) => [c.code, c]));
  const byPair = Object.fromEntries(coins.map((c) => [c.pair.split('/')[0], c]));

  const apply = (fx, crypto) => {
    const quotes = {}; // data-live kodu → [değer metni, değişim]

    if (fx) {
      for (const [key, code] of Object.entries(FX_MAP)) {
        const q = fx[key];
        const price = q && (q.Selling || q.Buying);
        if (!price) continue;
        byCode[code].rate = price;
        byCode[code].change = q.Change ?? byCode[code].change;
        quotes[code] = [fmt(price, code === 'USD' || code === 'EUR' || code === 'GBP' || code === 'CHF' ? 4 : 2), byCode[code].change];
      }
      if (fx.XU100?.Selling) quotes.XU100 = [fmt(fx.XU100.Selling, 2), fx.XU100.Change ?? 0];
      // Ons: kaynak fiyatı 0 döndürüyor → gram altın ve dolardan türetilir (1 ons = 31,1035 g)
      if (fx.GRA?.Selling && fx.USD?.Selling) quotes.ONS = [`$${fmt((fx.GRA.Selling * 31.1035) / fx.USD.Selling, 2)}`, fx.ONS?.Change ?? 0];
    }

    if (crypto) {
      for (const [sym, id] of Object.entries(COIN_IDS)) {
        const q = crypto[id];
        if (!q?.usd || !byPair[sym]) continue;
        byPair[sym].price = q.usd;
        byPair[sym].change.daily = +(q.usd_24h_change ?? 0).toFixed(2);
        quotes[sym] = [`$${fmt(q.usd, 2)}`, byPair[sym].change.daily];
      }
    }

    document.querySelectorAll('[data-live]').forEach((el) => {
      const q = quotes[el.dataset.live];
      if (!q) return;
      const current = el.querySelector('.ticker__value, .market-row__value > .t-h6-semibold')?.textContent;
      paint(el, q[0] ?? current, q[1]);
    });

    const updated = Object.keys(quotes).length;
    if (updated) {
      document.documentElement.dataset.live = 'on';
      onUpdate?.({ updated, at: new Date() });
    }
  };

  const load = async () => {
    const [fx, crypto] = await Promise.allSettled([getJSON(TRUNCGIL), getJSON(COINGECKO)]);
    apply(fx.status === 'fulfilled' ? fx.value : null, crypto.status === 'fulfilled' ? crypto.value : null);
  };

  load();
  setInterval(() => { if (!document.hidden) load(); }, REFRESH_MS);
}
