/**
 * Sabah Finans — arayüz etkileşimleri (framework'süz, ES module)
 *
 * İlk görünüm HTML'de hazırdır (SEO + JS'siz kullanım). Bu dosya yalnızca
 * kullanıcı etkileşimiyle içeriği data.js'teki örnek veriden yeniden çizer.
 * Canlı ortamda data.js yerine API yanıtı kullanılır; render fonksiyonları aynı kalır.
 */
import {
  headlines, currencies, currencyGroups, baseCurrencies,
  moneyAssets, bistLists, coins, cryptoPeriods, stocks, popularSearches,
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
   MANŞET — otomatik dönen slider
   Desktop : slaytlar üst üste, geçişte çapraz solma. nav-number'ın üzerine
             gelince / tıklayınca manşet değişir; aktif numaradaki halka
             sıradaki manşete geçişe kalan süreyi gösterir.
   Tablet/Mobil : yatay kaydırılan karosel (Figma 188:25592) — ortadaki kart
             tam boy, komşu kartlar %90,7 ölçekli ve 8px aralıklı; altta nokta.
   Otomatik geçiş fare/klavye odağı slider'dayken, dokunurken, sekme
   arka plandayken ve slider ekranda değilken durur (WCAG 2.2.2).
   "Hareketi azalt" tercihinde otomatik geçiş kapalıdır.
   --------------------------------------------------------------------------- */
const AUTOPLAY_MS = 6000;

const heroTickers = (tickers) => tickers.map(([symbol, change]) => `
  <li><a class="ticker-chip ticker-chip--solid" href="#"><span class="ticker-chip__symbol">${symbol}</span>${changeIndicator(change, parseNum(change))}</a></li>`).join('');

const heroSlide = (h, i) => `
  <article class="news-hero" role="group" aria-roledescription="slayt" aria-label="${i + 1} / ${headlines.length}">
    <img class="news-hero__img" src="${h.image}" width="1600" height="1066" alt="${h.alt}" loading="lazy">
    <div class="news-hero__body">
      <p class="news-hero__meta t-body-s-medium"><span>${h.category}</span><span class="news-hero__dot" aria-hidden="true">·</span><time>${h.time}</time></p>
      <h2 class="news-hero__title t-display-bold"><a href="#">${h.title}</a></h2>
      <ul class="news-hero__tickers" aria-label="İlgili hisseler">${heroTickers(h.tickers)}</ul>
    </div>
  </article>`;

function initHeadlineSlider() {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  const track = slider.querySelector('[data-hero-track]');
  const numbers = [...slider.querySelectorAll('.nav-number')];
  track.insertAdjacentHTML('beforeend', headlines.slice(1).map((h, i) => heroSlide(h, i + 1)).join(''));
  const slides = [...track.children];
  const count = slides.length;
  let current = 0;

  // İlerleme halkası (dekoratif) — CSS, slider'daki --progress (0…1) değerini çizer
  numbers.forEach((n) => n.insertAdjacentHTML('afterbegin',
    '<svg class="nav-number__ring" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="16.25"/></svg>'));

  const isCarousel = () => !isDesktop();
  const step = () => slides[1].offsetLeft - slides[0].offsetLeft;

  const setActive = (index) => {
    current = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.classList.toggle('is-before', i < current);
      slide.inert = !isCarousel() && i !== current; // desktop: gizli slaytlar odak almaz
    });
    numbers.forEach((n, i) => (i === current ? n.setAttribute('aria-current', 'true') : n.removeAttribute('aria-current')));
  };

  /* --- Otomatik geçiş ------------------------------------------------------ */
  let elapsed = 0;
  let last = null;
  const hold = { pointer: false, focus: false, touch: false, offscreen: false };
  const isHeld = () => document.hidden || Object.values(hold).some(Boolean);
  const restart = () => { elapsed = 0; slider.style.setProperty('--progress', '0'); };

  const go = (index, { scroll = true } = {}) => {
    const next = (index + count) % count;
    restart();
    if (next === current) return;
    setActive(next);
    if (scroll && isCarousel()) track.scrollTo({ left: next * step(), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const tick = (t) => {
    if (last !== null && !isHeld()) {
      elapsed += t - last;
      if (elapsed >= AUTOPLAY_MS) go(current + 1);
      slider.style.setProperty('--progress', (elapsed / AUTOPLAY_MS).toFixed(4));
    }
    last = t;
    requestAnimationFrame(tick);
  };

  /* --- Desktop: numara (hover + tıklama), oklar, klavye -------------------- */
  numbers.forEach((n, i) => {
    n.addEventListener('click', () => go(i));
    n.addEventListener('mouseenter', () => { if (!isCarousel()) go(i); });
  });
  slider.querySelector('[data-slide="prev"]')?.addEventListener('click', () => go(current - 1));
  slider.querySelector('[data-slide="next"]')?.addEventListener('click', () => go(current + 1));
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  // Yalnızca manşet kartının üzerindeyken durur; numaraya tıklayınca/üzerine gelince halka hemen dolmaya başlar
  const stage = slider.querySelector('.headline-slider__stage');
  stage.addEventListener('mouseenter', () => { hold.pointer = true; });
  stage.addEventListener('mouseleave', () => { hold.pointer = false; });
  // Klavye odağı durdurur; fareyle tıklanan numara (focus-visible değil) durdurmaz
  slider.addEventListener('focusin', (e) => {
    if (!e.target.matches(':focus-visible')) return;
    hold.focus = true;
    track.setAttribute('aria-live', 'polite');
  });
  slider.addEventListener('focusout', (e) => {
    if (slider.contains(e.relatedTarget)) return;
    hold.focus = false;
    track.setAttribute('aria-live', 'off');
  });

  /* --- Tablet/Mobil: karosel ---------------------------------------------
     Kaydırma konumu karelere bağlıdır: parmak hareket ettikçe kartlar
     311/343 ↔ 1 arasında ölçeklenir, nokta en yakın karta anında geçer.
     Bırakınca scroll-snap kartı ortalar (tek seferde bir kart). */
  const MIN_SCALE = 311 / 343;
  let frame = null;
  const paint = () => {
    frame = null;
    if (!isCarousel()) return;
    const f = track.scrollLeft / step();
    slides.forEach((slide, i) => {
      const d = Math.min(1, Math.abs(i - f));
      slide.style.transform = `scale(${1 - (1 - MIN_SCALE) * d})`;
      slide.style.transformOrigin = i > f ? 'left center' : 'right center';
    });
    const index = Math.min(count - 1, Math.max(0, Math.round(f)));
    if (index !== current) { setActive(index); restart(); }
  };
  track.addEventListener('scroll', () => { frame ??= requestAnimationFrame(paint); }, { passive: true });
  track.addEventListener('touchstart', () => { hold.touch = true; }, { passive: true });
  track.addEventListener('touchend', () => { hold.touch = false; restart(); });

  // Yandaki (küçük) karta dokunmak önce o kartı ortaya getirir
  track.addEventListener('click', (e) => {
    const slide = e.target.closest('.news-hero');
    if (!isCarousel() || !slide || slide.classList.contains('is-active')) return;
    e.preventDefault();
    go(slides.indexOf(slide));
  });

  matchMedia('(min-width: 1280px)').addEventListener('change', () => {
    setActive(current);
    if (isCarousel()) { track.scrollTo({ left: current * step() }); paint(); return; }
    slides.forEach((slide) => slide.style.removeProperty('transform'));
  });

  new IntersectionObserver(([entry]) => { hold.offscreen = !entry.isIntersecting; }, { threshold: 0.3 }).observe(slider);

  setActive(0);
  paint();
  if (!reducedMotion) requestAnimationFrame(tick);
}

/* ---------------------------------------------------------------------------
   SON DAKİKA
   Desktop      : yavaş otomatik kayma (30px/sn), hover/odakta durur. Oklar şeridi
                  bir haber ileri/geri alır, sonra otomatik kayma sürer. Döngü
                  kesintisizdir: liste bir kez kopyalanır, sona gelince başa sarar.
   Tablet/Mobil : otomatik kayma YOK — dokunmatikte parmakla kaydırma ile çakışır
                  (WCAG 2.2.2). Şerit doğal yatay kaydırılır, her başlıkta durur
                  (scroll-snap); tablet okları bir başlık ileri/geri alır.
   --------------------------------------------------------------------------- */
function initBreakingNews() {
  const list = document.querySelector('[data-scroller]');
  if (!list) return;

  const SPEED = 30; // px / sn
  const originals = [...list.children];
  let clones = [];
  let running = false;
  let paused = false;
  let last = null;
  let pos = 0;
  let target = null; // desktop: ok ile istenen konum

  const items = () => [...list.children];
  const offset = (li) => li.offsetLeft - originals[0].offsetLeft;
  const loopWidth = () => offset(clones[0]);
  const wrap = () => {
    const w = loopWidth();
    if (pos >= w) { pos -= w; if (target !== null) target -= w; }
    if (pos < 0) { pos += w; if (target !== null) target += w; }
  };

  const tick = (t) => {
    if (!running) return;
    if (last !== null) {
      const dt = (t - last) / 1000;
      if (target !== null) {
        pos += (target - pos) * Math.min(1, dt * 8); // yumuşak yaklaşma
        if (Math.abs(target - pos) < 0.5) { pos = target; target = null; }
      } else if (!paused) {
        pos += SPEED * dt;
      }
      wrap();
      list.scrollLeft = pos;
    }
    last = t;
    requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || reducedMotion) return;
    // Kesintisiz döngü için öğeleri bir kez çoğalt (ekran okuyucudan gizli)
    clones = originals.map((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelector('a')?.setAttribute('tabindex', '-1');
      list.append(clone);
      return clone;
    });
    list.classList.add('is-ticking');
    running = true;
    last = null;
    pos = list.scrollLeft;
    requestAnimationFrame(tick);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    target = null;
    clones.forEach((c) => c.remove());
    clones = [];
    list.classList.remove('is-ticking');
    list.scrollLeft = 0;
  };

  const pause = () => { paused = true; };
  const resume = () => { paused = false; pos = list.scrollLeft; };
  list.addEventListener('mouseenter', pause);
  list.addEventListener('mouseleave', resume);
  list.addEventListener('focusin', pause);
  list.addEventListener('focusout', resume);

  /* Desktop (otomatik kayma açık): hedefi bir haber ileri/geri taşı */
  const jump = (direction) => {
    const from = target ?? pos;
    if (direction > 0) {
      const next = items().find((li) => offset(li) > from + 1);
      target = next ? offset(next) : from;
    } else {
      let base = from;
      if (base < 1) { pos += loopWidth(); base += loopWidth(); } // döngünün kopya tarafından geri git
      const prev = items().filter((li) => offset(li) < base - 1).at(-1);
      target = prev ? offset(prev) : 0;
    }
  };

  /* Tablet (otomatik kayma kapalı): doğal kaydırmayla bir başlık ileri/geri */
  const step = (direction) => {
    const x = list.scrollLeft;
    const next = direction > 0
      ? originals.find((li) => offset(li) > x + 1)
      : originals.filter((li) => offset(li) < x - 1).at(-1);
    list.scrollTo({ left: next ? offset(next) : (direction > 0 ? list.scrollWidth : 0), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const direction = btn.dataset.scroll === 'next' ? 1 : -1;
      running ? jump(direction) : step(direction);
    });
  });

  const desktop = matchMedia('(min-width: 1280px)');
  const sync = () => (desktop.matches ? start() : stop());
  desktop.addEventListener('change', sync);
  sync();
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
   ARAMA
   Desktop      : header'daki alan; odakta panel açılır (Dropdown dili:
                  grup başlığı + 48px satır), 2 kolon — semboller | haberler.
   Tablet/Mobil : arama ikonu tam ekran görünüm açar. Geri butonu, Esc ve
                  cihazın geri tuşu (history) görünümü kapatır.
   Durumlar     : varsayılan (son aramalar + en çok arananlar + popüler
                  haberler) → yazarken (eşleşen semboller / haberler, eşleşme
                  vurgulu) → sonuç yok (öneri çipleri).
   Klavye       : ↑/↓ seçenekler arasında, Enter açar, Esc kapatır/temizler.
   --------------------------------------------------------------------------- */
const RECENT_KEY = 'sf-recent-searches';
const fold = (text) => text.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
const escapeHTML = (text) => text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/* Eşleşen kısmı <mark> ile vurgular (aksan/ büyük-küçük harf duyarsız) */
const highlight = (text, query) => {
  const i = query ? fold(text).indexOf(fold(query)) : -1;
  if (i < 0) return escapeHTML(text);
  const end = i + query.length;
  return `${escapeHTML(text.slice(0, i))}<mark>${escapeHTML(text.slice(i, end))}</mark>${escapeHTML(text.slice(end))}`;
};

function buildSearchIndex() {
  const symbols = [
    ...stocks.map((s) => ({ ...s, type: s.type || 'Hisse' })),
    ...currencies.filter((c) => c.code !== 'TRY').map((c) => ({
      code: c.label || `${c.code}/TRY`, name: c.label ? `${c.code}/TRY` : c.name, type: c.label ? 'Altın' : 'Döviz', logo: c.logo, change: c.change, key: c.code,
    })),
    ...coins.map((c) => ({ code: c.pair.split('/')[0], name: c.name, type: 'Kripto', logo: c.logo, avatar: c.avatar, change: c.change.daily })),
  ].map((s) => ({ ...s, key: s.key || s.code, haystack: fold(`${s.code} ${s.name}`) }));
  const news = headlines.map((h) => ({ ...h, haystack: fold(`${h.title} ${h.category}`) }));
  return { symbols, news, byKey: Object.fromEntries(symbols.map((s) => [s.key, s])) };
}

function initSearch() {
  const root = document.querySelector('[data-search]');
  if (!root) return;

  const layer = root.querySelector('[data-search-layer]');
  const form = root.querySelector('[data-search-form]');
  const input = root.querySelector('.search__input');
  const clearBtn = root.querySelector('[data-search-clear]');
  const panel = root.querySelector('[data-search-panel]');
  const openBtn = root.querySelector('[data-search-open]');
  const { symbols, news, byKey } = buildSearchIndex();
  const isOverlay = () => !isDesktop();
  const placeholder = { desktop: input.placeholder, overlay: 'Sembol kodu, şirket adı ara' };
  let active = -1;

  /* --- Son aramalar (yalnızca bu tarayıcıda) ------------------------------ */
  const readRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; } };
  const writeRecent = (list) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))); } catch { /* gizli sekme */ } };
  const remember = (term) => {
    const t = term.trim();
    if (t) writeRecent([t, ...readRecent().filter((r) => fold(r) !== fold(t))]);
  };

  /* --- Şablonlar ---------------------------------------------------------- */
  const symbolLogo = (s) => (s.logo
    ? `<span class="logo-currency logo-currency--32"><img src="${s.logo}" alt=""></span>`
    : `<span class="coin-avatar t-body-xs-semibold" style="--coin-color: ${s.avatar[1]}" aria-hidden="true">${s.avatar[0]}</span>`);

  const symbolItem = (s, q) => `
    <li><a class="search-item" href="#" role="option" data-search-option data-term="${s.code}">
      ${symbolLogo(s)}
      <span class="search-item__text">
        <span class="search-item__code t-body-m-semibold">${highlight(s.code, q)}</span>
        <span class="search-item__name t-body-s-regular">${highlight(s.name, q)}</span>
      </span>
      <span class="search-item__end">
        <span class="search-item__type t-body-xs-medium">${s.type}</span>
        ${changeIndicator(percent(s.change), s.change)}
      </span>
    </a></li>`;

  const newsItem = (n, q) => `
    <li><a class="search-news" href="#" role="option" data-search-option data-term="${escapeHTML(n.title)}">
      <span class="search-news__text">
        <span class="search-news__title t-body-m-semibold">${highlight(n.title, q)}</span>
        <span class="news-meta"><span class="t-body-xs-medium">${n.category}</span><span class="news-meta__dot" aria-hidden="true">·</span><span class="t-body-xs-medium">${n.time}</span></span>
      </span>
      <img class="search-news__img" src="${n.image}" alt="" loading="lazy">
    </a></li>`;

  const group = (title, body, extra = '') => `
    <section class="search-panel__group">
      <header class="search-panel__head"><h2 class="t-overline">${title}</h2>${extra}</header>
      ${body}
    </section>`;

  const list = (items) => `<ul class="search-panel__list" role="presentation">${items}</ul>`;

  const renderDefault = () => {
    const recent = readRecent();
    const popular = popularSearches.map((k) => byKey[k]).filter(Boolean);
    return `
      ${recent.length ? group('Son aramalar', `<ul class="search-chips">${recent.map((r) => `
        <li><button class="search-chip t-body-s-medium" type="button" data-search-option data-fill="${escapeHTML(r)}">${icon('clock')}${escapeHTML(r)}</button></li>`).join('')}</ul>`,
        '<button class="search-panel__action t-body-s-semibold" type="button" data-search-clear-recent>Temizle</button>') : ''}
      <div class="search-panel__columns">
        ${group('En çok arananlar', list(popular.slice(0, 6).map((s) => symbolItem(s)).join('')))}
        ${group('Popüler haberler', list(news.slice(0, 4).map((n) => newsItem(n)).join('')))}
      </div>`;
  };

  const renderResults = (q) => {
    const f = fold(q);
    // Kod başı eşleşmeler önce (THY → THYAO), sonra ad içinde geçenler
    const found = symbols.filter((s) => s.haystack.includes(f))
      .sort((a, b) => Number(!fold(a.code).startsWith(f)) - Number(!fold(b.code).startsWith(f)));
    const foundNews = news.filter((n) => n.haystack.includes(f));

    if (!found.length && !foundNews.length) {
      return `
        <div class="search-empty" role="status">
          <span class="search-empty__icon">${icon('search-normal')}</span>
          <p class="t-h6-semibold">“${escapeHTML(q)}” için sonuç bulunamadı</p>
          <p class="t-body-s-regular">Yazımı kontrol edin ya da sembol kodu (ör. THYAO) veya şirket adıyla arayın.</p>
          <ul class="search-chips">${popularSearches.slice(0, 5).map((k) => `
            <li><button class="search-chip t-body-s-medium" type="button" data-search-option data-fill="${byKey[k].code}">${byKey[k].code}</button></li>`).join('')}</ul>
        </div>`;
    }

    const none = (text) => `<p class="search-panel__none t-body-s-regular">${text}</p>`;
    return `
      <p class="visually-hidden" role="status">${found.length} sembol, ${foundNews.length} haber bulundu</p>
      <div class="search-panel__columns">
        ${group(`Semboller <span class="search-panel__count">${found.length}</span>`, found.length ? list(found.slice(0, 6).map((s) => symbolItem(s, q)).join('')) : none('Eşleşen sembol yok'))}
        ${group(`Haberler <span class="search-panel__count">${foundNews.length}</span>`, foundNews.length ? list(foundNews.slice(0, 4).map((n) => newsItem(n, q)).join('')) : none('Eşleşen haber yok'))}
      </div>
      <a class="search-panel__all t-body-m-semibold" href="#" data-search-option data-term="${escapeHTML(q)}">“${escapeHTML(q)}” için tüm sonuçları gör ${icon('arrow-right')}</a>`;
  };

  /* --- Durum -------------------------------------------------------------- */
  const options = () => [...panel.querySelectorAll('[data-search-option]')];

  const setActive = (index) => {
    const opts = options();
    opts.forEach((o) => o.classList.remove('is-active'));
    if (!opts.length || index < 0) { active = -1; input.removeAttribute('aria-activedescendant'); return; }
    active = (index + opts.length) % opts.length;
    const el = opts[active];
    el.id ||= `search-option-${active}`;
    el.classList.add('is-active');
    el.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', el.id);
  };

  const render = () => {
    const q = input.value.trim();
    clearBtn.hidden = !input.value;
    panel.innerHTML = q ? renderResults(q) : renderDefault();
    panel.dataset.state = q ? 'results' : 'default';
    setActive(-1);
  };

  const isOpen = () => !panel.hidden;

  const open = () => {
    if (isOpen()) return;
    openDropdown?.close(false);
    render();
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (isOverlay()) {
      root.classList.add('is-open');
      input.placeholder = placeholder.overlay;
      layer.setAttribute('role', 'dialog');
      layer.setAttribute('aria-modal', 'true');
      document.documentElement.classList.add('is-search-open');
      history.pushState({ search: true }, '', '#ara');
      requestAnimationFrame(() => input.focus());
    }
  };

  const close = ({ fromHistory = false } = {}) => {
    if (!isOpen()) return;
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
    if (root.classList.contains('is-open')) {
      root.classList.remove('is-open');
      input.placeholder = placeholder.desktop;
      layer.removeAttribute('role');
      layer.removeAttribute('aria-modal');
      document.documentElement.classList.remove('is-search-open');
      if (!fromHistory && history.state?.search) history.back();
      openBtn.focus();
    }
  };

  const choose = (el) => {
    if (el.dataset.fill !== undefined) { // çip: aramayı doldurur
      input.value = el.dataset.fill;
      render();
      input.focus();
      return;
    }
    remember(el.dataset.term);
    close();
    // Canlı ortamda: sembol/haber detay sayfasına yönlendirme (href)
  };

  /* --- Olaylar ------------------------------------------------------------ */
  openBtn.addEventListener('click', open);
  root.querySelector('[data-search-close]').addEventListener('click', () => close());
  input.addEventListener('focus', open);
  input.addEventListener('input', () => { if (!isOpen()) open(); render(); });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const opt = options()[active];
    if (opt) { choose(opt); return; }
    if (input.value.trim()) { remember(input.value); render(); } // Canlı ortamda: /arama?q=
  });

  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-search-clear-recent]')) {
      writeRecent([]);
      render();
      input.focus();
      return;
    }
    const opt = e.target.closest('[data-search-option]');
    if (!opt) return;
    e.preventDefault();
    choose(opt);
  });

  panel.addEventListener('mousemove', (e) => {
    const opt = e.target.closest('[data-search-option]');
    if (opt && !opt.classList.contains('is-active')) setActive(options().indexOf(opt));
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!isOpen()) open(); setActive(active + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (input.value) { input.value = ''; render(); } else { close(); input.blur(); }
    }
  });

  // Desktop: dışarı tıklayınca / odak çıkınca panel kapanır
  document.addEventListener('pointerdown', (e) => {
    if (!isOverlay() && isOpen() && !root.contains(e.target)) close();
  });
  root.addEventListener('focusout', (e) => {
    if (!isOverlay() && e.relatedTarget && !root.contains(e.relatedTarget)) close();
  });

  // Mobil: cihaz geri tuşu görünümü kapatır
  window.addEventListener('popstate', () => { if (root.classList.contains('is-open')) close({ fromHistory: true }); });

  // Kırılım değişirse (ör. tablet döndürme) açık durumu sıfırla
  matchMedia('(min-width: 1280px)').addEventListener('change', () => close());
  if (location.hash === '#ara') history.replaceState(null, '', location.pathname);
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
