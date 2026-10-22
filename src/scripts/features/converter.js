/**
 * DÖVİZ VE ALTIN ÇEVİRİCİ — Widget/Döviz ve Altın Çevirici
 */
import { currencies, currencyByCode, currencyGroups } from '../data.js';
import { changeIndicator } from '../components/index.js';
import { num, parseNum, percent } from '../core/format.js';
import { onLiveData } from '../core/dom.js';
import { createDropdown, setSelectValue } from './dropdown.js';

/* Tutar alanı: harf ve eksi işareti girilemez (inputmode=decimal mobil klavyeyi açar) */
const sanitizeAmount = (input) => { const v = input.value.replace(/[^\d.,]/g, ''); if (v !== input.value) input.value = v; };

export function initConverter() {
  const root = document.querySelector('[data-converter]');
  if (!root) return;

  const input = root.querySelector('[data-converter-input]');
  const output = root.querySelector('[data-converter-output]');
  const fromSel = root.querySelector('[data-select="from"]');
  const toSel = root.querySelector('[data-select="to"]');

  const update = () => {
    const from = currencyByCode[fromSel.dataset.value];
    const to = currencyByCode[toSel.dataset.value];
    const rate = from.rate / to.rate;
    output.value = num(parseNum(input.value) * rate);

    // "1 USD = 41,5612 TRY" — son iki ondalık tertiary
    const [int, frac] = num(rate, 4).split(',');
    root.querySelector('[data-converter-rate]').innerHTML =
      `1 ${from.label || from.code} = ${int},${frac.slice(0, 2)}<span class="converter__rate-fraction">${frac.slice(2)}</span> ${to.label || to.code}`;

    const change = from.change - to.change;
    root.querySelector('[data-converter-change]').outerHTML = changeIndicator(percent(change), change).replace('class="change', 'data-converter-change class="change');
    root.querySelector('[data-converter-spread]').innerHTML =
      `<span class="converter__meta-label">Alış</span> ${num(rate * 0.99911, 4)} &nbsp;·&nbsp; <span class="converter__meta-label">Satış</span> ${num(rate * 1.00089, 4)}`;

    fromSel.querySelector('[data-select-trigger]').setAttribute('aria-label', `Kaynak para birimi: ${from.label || from.code} ${from.name}`);
    toSel.querySelector('[data-select-trigger]').setAttribute('aria-label', `Hedef para birimi: ${to.label || to.code} ${to.name}`);
  };

  [fromSel, toSel].forEach((select) => createDropdown({
    select, items: currencies, groups: currencyGroups, searchable: true, onChange: update,
  }));

  root.querySelector('[data-converter-swap]').addEventListener('click', () => {
    const from = fromSel.dataset.value;
    setSelectValue(fromSel, toSel.dataset.value);
    setSelectValue(toSel, from);
    update();
  });

  input.addEventListener('input', () => { sanitizeAmount(input); update(); });
  input.addEventListener('blur', () => { input.value = num(parseNum(input.value)); });
  onLiveData(update);
  update();
}
