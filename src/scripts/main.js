/**
 * Sabah Finans — arayüz etkileşimleri (framework'süz, ES module)
 *
 * İlk görünüm HTML'de hazırdır (SEO + JS'siz kullanım). Bu dosya yalnızca
 * kullanıcı etkileşimiyle içeriği data.js'teki örnek veriden yeniden çizer.
 * Canlı ortamda data.js yerine API yanıtı kullanılır; render fonksiyonları aynı kalır.
 */
import {
  headlines, currencies, currencyGroups, baseCurrencies,
  moneyAssets, bistLists, coins, cryptoPeriods,
} from './data.js';

const ICONS = 'src/assets/icons/sprite.svg';
const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="${ICONS}#${id}"/></svg>`;
const byCode = Object.fromEntries(currencies.map((c) => [c.code, c]));
const isDesktop = () => matchMedia('(min-width: 1280px)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------------
   Biçimlendirme (tr-TR)
   --------------------------------------------------------------------------- */
const num = (value, digits = 2) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const parseNum = (text) => Number(String(text).replace(/\./g, '').replace(',', '.')) || 0;
const signed = (value, digits = 2) => `${value > 0 ? '+' : value < 0 ? '-' : ''}${num(Math.abs(value), digits)}`;
const percent = (value) => `${value > 0 ? '+' : value < 0 ? '-' : ''}%${num(Math.abs(value))}`;
const dir = (value) => (value < 0 ? 'down' : 'up');

/* change-indicator atomu */
const changeIndicator = (text, value) => `
  <span class="change change--${dir(value)}"><span class="change__icon"><svg aria-hidden="true"><use href="${ICONS}#arrow-${dir(value)}"/></svg></span><span class="t-body-xs-semibold">${text}</span></span>`;

/* İçerik değişiminde kısa opaklık geçişi */
function swapContent(el, html) {
  if (reducedMotion) { el.innerHTML = html; return; }
  el.classList.add('is-updating');
  setTimeout(() => { el.innerHTML = html; el.classList.remove('is-updating'); }, 150);
}

/* ---------------------------------------------------------------------------
   TAB GRUPLARI — [role="tablist"]
   Seçim + ←/→ klavye; `tabchange` olayıyla ilgili widget'a haber verir.
   --------------------------------------------------------------------------- */
function initTabs() {
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];

    const select = (tab, focus = true) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.classList.toggle('is-selected', selected);
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      if (focus) tab.focus();
      list.dispatchEvent(new CustomEvent('tabchange', { detail: tab.dataset.tab, bubbles: true }));
    };

    list.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab && tab.getAttribute('aria-selected') !== 'true') select(tab);
    });

    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });
}

const onTab = (group, handler) => {
  document.querySelector(`[data-tabs="${group}"]`)?.addEventListener('tabchange', (e) => handler(e.detail));
};

/* ---------------------------------------------------------------------------
   MANŞET — nav-number, oklar, klavye ve dokunmatik kaydırma
   --------------------------------------------------------------------------- */
function initHeadlineSlider() {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  const hero = slider.querySelector('[data-hero]');
  const img = hero.querySelector('[data-hero-img]');
  const numbers = [...slider.querySelectorAll('.nav-number')];
  let current = 0;

  const render = (h) => {
    img.src = h.image;
    img.alt = h.alt;
    hero.querySelector('[data-hero-category]').textContent = h.category;
    hero.querySelector('[data-hero-time]').textContent = h.time;
    hero.querySelector('[data-hero-title]').textContent = h.title;
    hero.querySelector('[data-hero-tickers]').innerHTML = h.tickers.map(([symbol, change]) => `
      <li><a class="ticker-chip ticker-chip--solid" href="#"><span class="ticker-chip__symbol">${symbol}</span>${changeIndicator(change, parseNum(change))}</a></li>`).join('');
  };

  const go = (index) => {
    const next = (index + headlines.length) % headlines.length;
    if (next === current) return;
    current = next;
    numbers.forEach((n, i) => (i === current ? n.setAttribute('aria-current', 'true') : n.removeAttribute('aria-current')));

    if (reducedMotion) { render(headlines[current]); return; }
    hero.classList.add('is-changing');
    setTimeout(() => {
      render(headlines[current]);
      hero.classList.remove('is-changing');
    }, 200);
  };

  numbers.forEach((n, i) => n.addEventListener('click', () => go(i)));
  slider.querySelector('[data-slide="prev"]')?.addEventListener('click', () => go(current - 1));
  slider.querySelector('[data-slide="next"]')?.addEventListener('click', () => go(current + 1));

  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  /* Dokunmatik: yatay kaydırma (tablet/mobilde oklar ve sayfalama gizlidir) */
  let startX = null;
  hero.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
  });

  /* Görselleri önceden yükle — geçişte boşluk olmasın */
  [...new Set(headlines.map((h) => h.image))].forEach((src) => { new Image().src = src; });
}

/* ---------------------------------------------------------------------------
   SON DAKİKA — yavaş otomatik kayma, hover/odakta durur, oklarla atlanır
   --------------------------------------------------------------------------- */
function initBreakingNews() {
  const list = document.querySelector('[data-scroller]');
  if (!list) return;

  const SPEED = 30; // px / sn
  let paused = false;
  let last = null;
  let pos = list.scrollLeft;

  // Kesintisiz döngü için öğeleri bir kez çoğalt (ekran okuyucudan gizli)
  const originals = [...list.children];
  originals.forEach((li) => {
    const clone = li.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelector('a')?.setAttribute('tabindex', '-1');
    list.append(clone);
  });
  list.classList.add('is-ticking');

  const loopWidth = () => originals.at(-1).offsetLeft + originals.at(-1).offsetWidth + 16 - originals[0].offsetLeft;

  const tick = (t) => {
    if (last !== null && !paused) {
      pos += (SPEED * (t - last)) / 1000;
      if (pos >= loopWidth()) pos -= loopWidth();
      list.scrollLeft = pos;
    }
    last = t;
    requestAnimationFrame(tick);
  };

  const pause = () => { paused = true; };
  const resume = () => { paused = false; pos = list.scrollLeft; };

  list.addEventListener('mouseenter', pause);
  list.addEventListener('mouseleave', resume);
  list.addEventListener('focusin', pause);
  list.addEventListener('focusout', resume);
  list.addEventListener('touchstart', pause, { passive: true });
  list.addEventListener('touchend', () => setTimeout(resume, 2000));

  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = (btn.dataset.scroll === 'next' ? 1 : -1) * list.clientWidth * 0.6;
      list.scrollTo({ left: Math.max(0, list.scrollLeft + delta), behavior: 'smooth' });
      setTimeout(() => { pos = list.scrollLeft; }, 450);
    });
  });

  if (!reducedMotion) requestAnimationFrame(tick);
}

/* ---------------------------------------------------------------------------
   DROPDOWN — Dropdown/Para Birimi (arama + grup) ve kompakt varyant
   --------------------------------------------------------------------------- */
let openDropdown = null;

function createDropdown({ select, items, groups, searchable, onChange }) {
  const trigger = select.querySelector('[data-select-trigger]');
  const id = `dd-${select.dataset.select}`;
  const panel = document.createElement('div');
  panel.className = `dropdown${searchable ? '' : ' dropdown--compact'}`;
  panel.hidden = true;
  panel.innerHTML = `
    ${searchable ? `<label class="dropdown__search">${icon('search-normal')}<input class="t-body-m-regular" type="search" placeholder="Para birimi veya altın ara" aria-label="Para birimi veya altın ara" aria-controls="${id}" autocomplete="off"></label>` : ''}
    <ul class="dropdown__list" id="${id}" role="listbox" tabindex="-1" aria-label="${trigger.getAttribute('aria-label') || 'Para birimi'}"></ul>`;
  select.append(panel);
  trigger.setAttribute('aria-controls', id);

  const list = panel.querySelector('[role="listbox"]');
  const search = panel.querySelector('input');
  let active = -1;

  const optionHTML = (c) => `
    <li class="dropdown-item" role="option" id="${id}-${c.code}" data-code="${c.code}" aria-selected="${c.code === select.dataset.value}">
      <span class="logo-currency logo-currency--24"><img src="${c.logo}" alt=""></span>
      <span class="dropdown-item__text t-body-m-regular">
        ${c.label ? `<span class="dropdown-item__code t-body-m-semibold">${c.label}</span>` : `<span class="dropdown-item__code t-body-m-semibold">${c.code}</span><span class="dropdown-item__name">${c.name}</span>`}
      </span>
      ${icon('tick-circle', 'dropdown-item__check')}
    </li>`;

  const render = (query = '') => {
    const q = query.trim().toLocaleLowerCase('tr');
    const match = (c) => !q || `${c.code} ${c.name}`.toLocaleLowerCase('tr').includes(q);
    let html = '';
    if (groups && !q) {
      groups.forEach((g, i) => {
        const inGroup = items.filter((c) => c.group === g.id);
        if (!inGroup.length) return;
        if (i > 0) html += '<li class="dropdown__divider" role="separator"></li>';
        html += `<li class="dropdown__group t-overline" role="presentation">${g.label}</li>${inGroup.map(optionHTML).join('')}`;
      });
    } else {
      const found = items.filter(match);
      html = found.length ? found.map(optionHTML).join('') : '<li class="dropdown__empty t-body-s-regular" role="presentation">Sonuç bulunamadı</li>';
    }
    list.innerHTML = html;
    active = -1;
  };

  const options = () => [...list.querySelectorAll('[role="option"]')];

  const setActive = (index) => {
    const opts = options();
    if (!opts.length) return;
    active = (index + opts.length) % opts.length;
    opts.forEach((o, i) => o.classList.toggle('is-active', i === active));
    opts[active].scrollIntoView({ block: 'nearest' });
    (search || list).setAttribute('aria-activedescendant', opts[active].id);
  };

  const close = (returnFocus = true) => {
    if (panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    openDropdown = null;
    if (returnFocus) trigger.focus();
  };

  const open = () => {
    openDropdown?.close(false);
    render();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    openDropdown = { close, panel, select };
    const selectedIndex = options().findIndex((o) => o.getAttribute('aria-selected') === 'true');
    setActive(Math.max(0, selectedIndex));
    (search || list).focus();
  };

  const choose = (code) => {
    select.dataset.value = code;
    const c = byCode[code];
    trigger.querySelector('img').src = c.logo;
    trigger.querySelector('.currency-select__code').textContent = c.label || c.code;
    const name = trigger.querySelector('.currency-select__name');
    if (name) { name.textContent = c.label ? '' : c.name; name.hidden = Boolean(c.label); }
    close();
    onChange(code);
  };

  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && panel.hidden) { e.preventDefault(); open(); }
  });
  search?.addEventListener('input', () => { render(search.value); setActive(0); });
  list.addEventListener('click', (e) => {
    const opt = e.target.closest('[role="option"]');
    if (opt) choose(opt.dataset.code);
  });
  list.addEventListener('mousemove', (e) => {
    const opt = e.target.closest('[role="option"]');
    if (opt) setActive(options().indexOf(opt));
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    if (e.key === 'Enter') { e.preventDefault(); const o = options()[active]; if (o) choose(o.dataset.code); }
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') close(false);
  });
}

document.addEventListener('pointerdown', (e) => {
  if (openDropdown && !openDropdown.select.contains(e.target)) openDropdown.close(false);
});

/* ---------------------------------------------------------------------------
   DÖVİZ VE ALTIN ÇEVİRİCİ
   --------------------------------------------------------------------------- */
function initConverter() {
  const root = document.querySelector('[data-converter]');
  if (!root) return;

  const input = root.querySelector('[data-converter-input]');
  const output = root.querySelector('[data-converter-output]');
  const fromSel = root.querySelector('[data-select="from"]');
  const toSel = root.querySelector('[data-select="to"]');

  const update = () => {
    const from = byCode[fromSel.dataset.value];
    const to = byCode[toSel.dataset.value];
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

  const setSelect = (sel, code) => {
    sel.dataset.value = code;
    const c = byCode[code];
    const trigger = sel.querySelector('[data-select-trigger]');
    trigger.querySelector('img').src = c.logo;
    trigger.querySelector('.currency-select__code').textContent = c.label || c.code;
    const name = trigger.querySelector('.currency-select__name');
    name.textContent = c.label ? '' : c.name;
    name.hidden = Boolean(c.label);
  };

  [fromSel, toSel].forEach((select) => createDropdown({
    select, items: currencies, groups: currencyGroups, searchable: true, onChange: update,
  }));

  root.querySelector('[data-converter-swap]').addEventListener('click', () => {
    const a = fromSel.dataset.value;
    setSelect(fromSel, toSel.dataset.value);
    setSelect(toSel, a);
    update();
  });

  input.addEventListener('input', update);
  update();
}

/* ---------------------------------------------------------------------------
   PARAMIN KARŞILIĞI NE OLURDU? — dönem tab'ı + para birimi + miktar
   --------------------------------------------------------------------------- */
const SYMBOLS = { TRY: '₺', USD: '$', EUR: '€', GBP: '£', CHF: 'CHF' };

function initMoney() {
  const root = document.querySelector('[data-money]');
  if (!root) return;

  const amountInput = root.querySelector('[data-money-amount]');
  const select = root.querySelector('[data-select="money"]');
  let period = 'daily';

  const render = (animate = true) => {
    const amount = parseNum(amountInput.value);
    const symbol = SYMBOLS[select.dataset.value];
    const max = Math.max(...moneyAssets.map((a) => Math.abs(a.returns[period])));

    root.querySelector('[data-money-symbol]').textContent = symbol;
    root.querySelector('[data-money-badge]').textContent = `${num(amount, 0)} ${symbol}`;

    const html = moneyAssets.map((a) => {
      const r = a.returns[period];
      return `
        <li class="money-row">
          <span class="market-row__asset"><span class="logo-currency logo-currency--18"><img src="${a.logo}" alt=""></span><span class="t-body-m-medium">${a.name}</span></span>
          <span class="money-bar money-bar--${dir(r)}" style="--value: ${(Math.abs(r) / max).toFixed(2)}" aria-hidden="true"><span class="money-bar__fill"></span></span>
          <span class="market-row__value"><span class="t-h6-semibold">${num(amount * (1 + r / 100))} ${symbol}</span>${changeIndicator(percent(r), r)}</span>
        </li>`;
    }).join('');

    const rows = root.querySelector('[data-money-rows]');
    animate ? swapContent(rows, html) : (rows.innerHTML = html);
  };

  createDropdown({
    select,
    items: baseCurrencies.map((code) => ({ ...byCode[code], group: undefined })),
    searchable: false,
    onChange: () => render(),
  });

  onTab('money', (value) => { period = value; render(); });
  amountInput.addEventListener('input', () => render(false));
  amountInput.addEventListener('blur', () => { amountInput.value = num(parseNum(amountInput.value), 0); });
}

/* ---------------------------------------------------------------------------
   BIST ÖNE ÇIKANLAR — Yükselen / Düşen / En Aktif
   --------------------------------------------------------------------------- */
function initBist() {
  const tiles = document.querySelector('[data-bist-tiles]');
  if (!tiles) return;

  onTab('bist', (key) => {
    swapContent(tiles, bistLists[key].map((s) => `
      <li><a class="stock-tile" href="#">
        <span class="stock-tile__top"><img class="logo-company logo-company--20${s.bordered ? ' logo-company--bordered' : ''}" src="${s.logo}" alt=""><span class="t-body-s-semibold">${s.code}</span></span>
        <span class="stock-tile__values"><span class="t-h6-semibold ${s.change < 0 ? 'is-negative' : 'is-positive'}">${percent(s.change)}</span><span class="t-body-xs-regular">${s.volume || `${s.price} ₺`}</span></span>
      </a></li>`).join(''));
  });
}

/* ---------------------------------------------------------------------------
   KRİPTO PARALAR — Günlük / Haftalık / Aylık / Yıllık
   --------------------------------------------------------------------------- */
function initCrypto() {
  const body = document.querySelector('[data-crypto-rows]');
  if (!body) return;

  const usd = (v, d) => `$ ${num(v, d)}`;

  onTab('crypto', (period) => {
    const { range } = cryptoPeriods[period];
    swapContent(body, coins.map((c) => {
      const change = c.change[period];
      const logo = c.logo
        ? `<span class="logo-currency logo-currency--32"><img src="${c.logo}" alt=""></span>`
        : `<span class="coin-avatar t-body-xs-semibold" style="--coin-color: ${c.avatar[1]}" aria-hidden="true">${c.avatar[0]}</span>`;
      return `
        <tr>
          <th scope="row"><span class="coin">${logo}<span class="coin__name"><span class="t-body-m-semibold">${c.pair}</span><span class="coin__full t-body-xs-regular">${c.name}</span></span></span></th>
          <td class="t-numeric-m-semibold">${usd(c.price, c.decimals)}</td>
          <td class="crypto-table__hide-sm t-body-m-regular">${usd(c.price * (1 + range * 0.55), c.decimals)}</td>
          <td class="crypto-table__hide-sm t-body-m-regular">${usd(c.price * (1 - range * 0.45), c.decimals)}</td>
          <td><span class="change-pill change-pill--${dir(change)} t-body-s-semibold">${percent(change)}</span></td>
        </tr>`;
    }).join(''));
  });
}

/* ---------------------------------------------------------------------------
   YAN KOLON — panel sonu görünür olduğunda sabitlenir (desktop)
   Panel ekrandan kısaysa header'ın altında, uzunsa alt kenarı ekranın altında durur.
   --------------------------------------------------------------------------- */
function initStickySidebar() {
  const sidebar = document.querySelector('.page__sidebar');
  const header = document.querySelector('.site-header');
  if (!sidebar) return;

  const GAP = 16;
  const update = () => {
    if (!isDesktop()) { sidebar.style.removeProperty('--sidebar-sticky-top'); return; }
    const headerH = header.offsetHeight;
    const top = Math.min(headerH + GAP, window.innerHeight - sidebar.offsetHeight - GAP);
    sidebar.style.setProperty('--sidebar-sticky-top', `${top}px`);
  };

  new ResizeObserver(update).observe(sidebar);
  window.addEventListener('resize', update);
  update();
}

/* ---------------------------------------------------------------------------
   MOBİL/TABLET ARAMA — ikon ilk dokunuşta alanı açar
   --------------------------------------------------------------------------- */
function initSearch() {
  const form = document.querySelector('.search');
  if (!form) return;
  const input = form.querySelector('.search__input');

  form.addEventListener('submit', (e) => {
    const collapsed = getComputedStyle(input).display === 'none';
    if (collapsed || (!input.value.trim() && form.classList.contains('is-open'))) {
      e.preventDefault();
      form.classList.toggle('is-open');
      if (form.classList.contains('is-open')) input.focus();
    }
  });
}

initTabs();
initHeadlineSlider();
initBreakingNews();
initConverter();
initMoney();
initBist();
initCrypto();
initStickySidebar();
initSearch();
