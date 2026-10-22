/**
 * PARAMIN KARŞILIĞI NE OLURDU? — dönem tab'ı + para birimi + miktar
 * Satırlar components/market.js › moneyRows ile çizilir (derlemedeki ilk görünümle aynı şablon).
 */
import { moneyAssets, baseCurrencies, currencyByCode } from '../data.js';
import { moneyRows } from '../components/index.js';
import { num, parseNum } from '../core/format.js';
import { onTab, swapContent } from '../core/dom.js';
import { createDropdown } from './dropdown.js';

const SYMBOLS = { TRY: '₺', USD: '$', EUR: '€', GBP: '£', CHF: 'CHF' };
const MAX_AMOUNT = 1_000_000_000; // 1 milyar — üstü anlamlı bir senaryo değil, düzeni de bozar

/* Tam sayı tutar alanı: yazarken binlik ayırıcı ekler, imleç yerini korur, üst sınırı uygular */
const formatIntegerInput = (input) => {
  const caret = input.selectionStart ?? input.value.length;
  const digitsRight = input.value.slice(caret).replace(/\D/g, '').length;
  let digits = input.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  const capped = Number(digits || 0) > MAX_AMOUNT;
  if (capped) digits = String(MAX_AMOUNT);
  const formatted = digits ? num(Number(digits), 0) : '';
  input.value = formatted;
  // imleç: sağındaki rakam sayısı aynı kalacak şekilde
  let pos = formatted.length, seen = 0;
  while (pos > 0 && seen < digitsRight) { pos -= 1; if (/\d/.test(formatted[pos])) seen += 1; }
  input.setSelectionRange(pos, pos);
  return capped;
};


export function initMoney() {
  const root = document.querySelector('[data-money]');
  if (!root) return;

  const amountInput = root.querySelector('[data-money-amount]');
  const select = root.querySelector('[data-select="money"]');
  const hint = root.querySelector('[data-money-hint]');
  const rows = root.querySelector('[data-money-rows]');
  let period = 'daily';

  const render = (animate = true) => {
    const symbol = SYMBOLS[select.dataset.value];
    root.querySelector('[data-money-symbol]').textContent = symbol;
    const html = moneyRows(moneyAssets, { period, amount: parseNum(amountInput.value), symbol });
    animate ? swapContent(rows, html) : (rows.innerHTML = html);
  };

  createDropdown({
    select,
    items: baseCurrencies.map((code) => ({ ...currencyByCode[code], group: undefined })),
    searchable: false,
    onChange: () => render(),
  });

  onTab('money', (value) => { period = value; render(); });
  amountInput.addEventListener('input', () => {
    const capped = formatIntegerInput(amountInput);
    if (hint) hint.hidden = !capped;
    render(false);
  });
  amountInput.addEventListener('blur', () => {
    if (!amountInput.value) amountInput.value = '0';
    if (hint) hint.hidden = true;
  });
}
