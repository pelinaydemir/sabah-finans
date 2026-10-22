/**
 * KRİPTO PARALAR — Günlük / Haftalık / Aylık / Yıllık; canlı veri gelince yenilenir
 */
import { coins, cryptoPeriods } from '../data.js';
import { cryptoRow } from '../components/index.js';
import { onTab, onLiveData, swapContent } from '../core/dom.js';

export function initCrypto() {
  const body = document.querySelector('[data-crypto-rows]');
  if (!body) return;

  let current = 'daily';
  const render = (period) => {
    current = period;
    const { range } = cryptoPeriods[period];
    swapContent(body, coins.map((c) => cryptoRow(c, { period, range })).join(''));
  };

  onTab('crypto', render);
  onLiveData(() => render(current));
}
