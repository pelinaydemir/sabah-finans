/**
 * Sabah Finans — arayüz etkileşimleri (framework'süz, progressive enhancement)
 * JS yüklenmezse sayfa içerik olarak eksiksiz kalır; bu dosya yalnızca
 * durum değişimlerini (seçili tab, manşet sayfası, çevirici) yönetir.
 */

/* Tab grupları — [role="tablist"]: tıklama + ←/→ klavye gezinmesi */
function initTabs() {
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];

    const select = (tab) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.classList.toggle('is-selected', selected);
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      tab.focus();
    };

    list.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) select(tab);
    });

    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });
}

/* Manşet — nav-number + önceki/sonraki okları aynı durumu paylaşır */
function initHeadlineSlider() {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  const numbers = [...slider.querySelectorAll('.nav-number')];
  let current = 0;

  const go = (index) => {
    current = (index + numbers.length) % numbers.length;
    numbers.forEach((n, i) => {
      if (i === current) n.setAttribute('aria-current', 'true');
      else n.removeAttribute('aria-current');
    });
  };

  numbers.forEach((n, i) => n.addEventListener('click', () => go(i)));
  slider.querySelector('[data-slide="prev"]')?.addEventListener('click', () => go(current - 1));
  slider.querySelector('[data-slide="next"]')?.addEventListener('click', () => go(current + 1));
}

/* Son dakika şeridi — oklar listeyi bir ekran genişliği kaydırır */
function initScroller() {
  const list = document.querySelector('[data-scroller]');
  if (!list) return;

  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.scroll === 'next' ? 1 : -1;
      list.scrollBy({ left: dir * list.clientWidth * 0.8 });
    });
  });
}

/* Döviz çevirici — miktar × kur; swap ile yön değişir */
function initConverter() {
  const root = document.querySelector('[data-converter]');
  if (!root) return;

  const input = root.querySelector('[data-converter-input]');
  const output = root.querySelector('[data-converter-output]');
  const rate = Number(root.dataset.rate);
  const fmt = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parse = (value) => Number(value.replace(/\./g, '').replace(',', '.')) || 0;
  let reversed = false;

  const update = () => {
    const amount = parse(input.value);
    output.value = fmt.format(reversed ? amount / rate : amount * rate);
  };

  root.querySelector('[data-converter-swap]').addEventListener('click', () => {
    reversed = !reversed;
    const [from, to] = root.querySelectorAll('.currency-select');
    const swap = (selector) => {
      const a = from.querySelector(selector);
      const b = to.querySelector(selector);
      [a.textContent, b.textContent] = [b.textContent, a.textContent];
    };
    const [imgA, imgB] = [from.querySelector('img'), to.querySelector('img')];
    [imgA.src, imgB.src] = [imgB.src, imgA.src];
    swap('[data-currency-code]');
    swap('[data-currency-name]');
    update();
  });

  input.addEventListener('input', update);
  update();
}

/* Mobil/tablet arama — ikon ilk dokunuşta alanı açar */
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
initScroller();
initConverter();
initSearch();
