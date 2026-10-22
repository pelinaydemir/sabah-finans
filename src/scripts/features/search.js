/**
 * ARAMA
 * Desktop      : header'daki alan; odakta panel açılır (Dropdown dili:
 *                grup başlığı + 48px satır), 2 kolon — semboller | haberler.
 * Tablet/Mobil : arama ikonu tam ekran görünüm açar. Geri butonu, Esc ve
 *                cihazın geri tuşu (history) görünümü kapatır.
 * Durumlar     : varsayılan (son aramalar + en çok arananlar + popüler
 *                haberler) → yazarken (eşleşen semboller / haberler, eşleşme
 *                vurgulu) → sonuç yok (öneri çipleri).
 * Klavye       : ↑/↓ seçenekler arasında, Enter açar, Esc kapatır/temizler.
 */
import { headlines, currencies, coins, stocks, popularSearches } from '../data.js';
import { icon, changeIndicator, coinLogo } from '../components/index.js';
import { percent, fold, escapeHTML } from '../core/format.js';
import { isDesktop, onBreakpointChange, onLiveData } from '../core/dom.js';
import { closeOpenDropdown } from './dropdown.js';

const RECENT_KEY = 'sf-recent-searches';

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

export function initSearch() {
  const root = document.querySelector('[data-search]');
  if (!root) return;

  const layer = root.querySelector('[data-search-layer]');
  const form = root.querySelector('[data-search-form]');
  const input = root.querySelector('.search__input');
  const clearBtn = root.querySelector('[data-search-clear]');
  const panel = root.querySelector('[data-search-panel]');
  const openBtn = root.querySelector('[data-search-open]');
  let { symbols, news, byKey } = buildSearchIndex();
  onLiveData(() => ({ symbols, news, byKey } = buildSearchIndex()));
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
  const symbolItem = (s, q) => `
    <li><a class="search-item" href="#" role="option" data-search-option data-term="${s.code}">
      ${coinLogo(s)}
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
    closeOpenDropdown();
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
    // Aktif seçenek yoksa ilk sonuç açılır (ör. "thyao" + Enter → THYAO); sonuç yoksa panel açık kalır
    const opt = options()[active] ?? (input.value.trim() ? panel.querySelector('.search-item, .search-news') : null);
    if (opt) choose(opt);
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
  onBreakpointChange(() => close());
  if (location.hash === '#ara') history.replaceState(null, '', location.pathname);
}
