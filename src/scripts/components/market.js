/**
 * PİYASA — Finance/Ticker, Piyasa Özeti satırı, Paramın Karşılığı satırı,
 * BIST hisse karosu, kripto tablo satırı. Statik sayfa ve etkileşim aynı şablonu kullanır.
 */
import { num, percent, dir, compact } from '../core/format.js';
import { changeIndicator, sparkline, logoCurrency, logoCompany, coinLogo } from './atoms.js';

/** Finance/Ticker — finans barı öğesi; data-live canlı veri eşlemesi */
export const ticker = (item) => {
  const d = dir(parseFloat(item.change.replace(',', '.')));
  return `<li class="ticker" data-live="${item.code}"><a class="ticker__link" href="#"><span class="ticker__info"><span class="ticker__name t-body-m-medium">${item.name}</span><span class="ticker__value t-h6-semibold">${item.value}</span>${changeIndicator(item.change)}</span>${sparkline(d, { hidden: true })}</a></li>`;
};

/** Varlık adı + logo (Piyasa Özeti ve Paramın Karşılığı ortak) */
const asset = (logo, name, size) => `<span class="market-row__asset">${logoCurrency(logo, size)}<span class="t-body-m-medium">${name}</span></span>`;

/** Widget/Piyasa Özeti satırı */
export const marketRow = (item) => {
  const d = dir(parseFloat(item.change.replace(',', '.')));
  return `<li class="market-row" data-live="${item.code}">${asset(item.logo, item.name, 18)}<span class="market-row__chart" aria-hidden="true">${sparkline(d)}</span><span class="market-row__value"><span class="t-h6-semibold">${item.value}</span>${changeIndicator(item.change)}</span></li>`;
};

/** Paramın Karşılığı satırı — tutar + oran çubuğu (max: dönemdeki en büyük mutlak getiri) */
const moneyRow = (item, { period, amount, symbol, max }) => {
  const r = item.returns[period];
  const value = amount * (1 + r / 100);
  const full = `${num(value)} ${symbol}`;
  return `<li class="money-row"><div class="money-row__top">${asset(item.logo, item.name, 20)}<span class="money-row__value"><span class="money-row__amount t-body-m-semibold" title="${full}" aria-label="${full}">${compact(value)} ${symbol}</span>${changeIndicator(percent(r), r)}</span></div><span class="money-bar money-bar--${dir(r)}" style="--value: ${(Math.abs(r) / max).toFixed(2)}" aria-hidden="true"><span class="money-bar__fill"></span></span></li>`;
};

/** Paramın Karşılığı listesi */
export const moneyRows = (assets, { period, amount, symbol }) => {
  const max = Math.max(...assets.map((a) => Math.abs(a.returns[period])));
  return assets.map((a) => moneyRow(a, { period, amount, symbol, max })).join('');
};

/** BIST Öne Çıkanlar karosu */
export const stockTile = (s) => `<li><a class="stock-tile" href="#"><span class="stock-tile__top">${logoCompany(s.logo, 20, { bordered: s.bordered })}<span class="t-body-s-semibold">${s.code}</span></span><span class="stock-tile__values"><span class="t-h6-semibold ${s.change < 0 ? 'is-negative' : 'is-positive'}">${percent(s.change)}</span><span class="t-body-xs-regular">${s.volume || `${s.price} ₺`}</span></span></a></li>`;

/** Kripto Paralar tablo satırı — yüksek/düşük, dönem aralığından türetilir */
export const cryptoRow = (c, { period, range }) => {
  const usd = (v) => `$ ${num(v, c.decimals)}`;
  const change = c.change[period];
  return `<tr><th scope="row"><span class="coin">${coinLogo(c)}<span class="coin__name"><span class="t-body-m-semibold">${c.pair}</span><span class="coin__full t-body-xs-regular">${c.name}</span></span></span></th><td class="t-numeric-m-semibold">${usd(c.price)}</td><td class="crypto-table__hide-sm t-body-m-regular">${usd(c.price * (1 + range * 0.55))}</td><td class="crypto-table__hide-sm t-body-m-regular">${usd(c.price * (1 - range * 0.45))}</td><td><span class="change-pill change-pill--${dir(change)} t-body-s-semibold">${percent(change)}</span></td></tr>`;
};
