/**
 * DROPDOWN — Dropdown/Para Birimi (arama + grup) ve kompakt varyant
 * Tablet/Mobil: bottom sheet olarak açılır (Figma 286:24156 "sheet").
 * Liste/arama/klavye davranışı aynı kalır; panel geçici olarak <body>'ye taşınır ki
 * kapsayıcıların overflow/transform'u etkilemesin, kapanınca yerine döner.
 */
import { currencyByCode } from '../data.js';
import { icon, logoCurrency } from '../components/index.js';
import { isDesktop, onBreakpointChange } from '../core/dom.js';

let openDropdown = null;

/** Açık dropdown varsa kapatır (ör. arama açılırken) */
export const closeOpenDropdown = () => openDropdown?.close(false);

/** Tetikleyiciyi (logo + kod + ad) seçilen para birimine göre günceller */
export function setSelectValue(select, code) {
  const c = currencyByCode[code];
  select.dataset.value = code;
  const trigger = select.querySelector('[data-select-trigger]');
  trigger.querySelector('img').src = c.logo;
  trigger.querySelector('.currency-select__code').textContent = c.label || c.code;
  const name = trigger.querySelector('.currency-select__name');
  if (name) { name.textContent = c.label ? '' : c.name; name.hidden = Boolean(c.label); }
}

/** Dropdown/Para Birimi seçeneği */
const option = (id, c, selected) => `
  <li class="dropdown-item" role="option" id="${id}-${c.code}" data-code="${c.code}" aria-selected="${selected}">
    ${logoCurrency(c.logo, 24)}
    <span class="dropdown-item__text t-body-m-regular">
      ${c.label ? `<span class="dropdown-item__code t-body-m-semibold">${c.label}</span>` : `<span class="dropdown-item__code t-body-m-semibold">${c.code}</span><span class="dropdown-item__name">${c.name}</span>`}
    </span>
    ${icon('tick-circle', 'dropdown-item__check')}
  </li>`;

const isSheetMode = () => !isDesktop();
let sheetOverlay = null;
const getSheetOverlay = () => {
  if (!sheetOverlay) {
    sheetOverlay = document.createElement('div');
    sheetOverlay.className = 'sheet-overlay';
    sheetOverlay.hidden = true;
    sheetOverlay.addEventListener('click', () => openDropdown?.close());
    document.body.append(sheetOverlay);
  }
  return sheetOverlay;
};

export function createDropdown({ select, items, groups, searchable, onChange }) {
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

  const render = (query = '') => {
    const q = query.trim().toLocaleLowerCase('tr');
    const match = (c) => !q || `${c.code} ${c.name}`.toLocaleLowerCase('tr').includes(q);
    const optionHTML = (c) => option(id, c, c.code === select.dataset.value);
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

  // Bottom sheet tutamacı (dekoratif) — aşağı kaydırınca kapatır
  const grabber = document.createElement('div');
  grabber.className = 'dropdown__grabber';
  grabber.setAttribute('aria-hidden', 'true');

  const toSheet = () => {
    panel.classList.add('dropdown--sheet');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', trigger.getAttribute('aria-label') || 'Para birimi seçin');
    panel.prepend(grabber);
    document.body.append(panel);
    getSheetOverlay().hidden = false;
    document.documentElement.classList.add('is-sheet-open');
  };

  const fromSheet = () => {
    panel.classList.remove('dropdown--sheet');
    ['role', 'aria-modal', 'aria-label'].forEach((a) => panel.removeAttribute(a));
    panel.style.removeProperty('transform');
    grabber.remove();
    select.append(panel);
    getSheetOverlay().hidden = true;
    document.documentElement.classList.remove('is-sheet-open');
  };

  const close = (returnFocus = true) => {
    if (panel.hidden) return;
    panel.hidden = true;
    if (panel.classList.contains('dropdown--sheet')) fromSheet();
    trigger.setAttribute('aria-expanded', 'false');
    openDropdown = null;
    if (returnFocus) trigger.focus();
  };

  const open = () => {
    openDropdown?.close(false);
    render();
    const sheet = isSheetMode();
    if (sheet) toSheet();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    openDropdown = { close, panel, select };
    const selectedIndex = options().findIndex((o) => o.getAttribute('aria-selected') === 'true');
    setActive(Math.max(0, selectedIndex));
    // Dokunmatikte arama alanına otomatik odak klavyeyi açıp listeyi kapatır → listeye odaklanılır
    (sheet && matchMedia('(pointer: coarse)').matches ? list : (search || list)).focus({ preventScroll: true });
  };

  // Aşağı sürükleyerek kapatma (tutamaç veya liste en üstteyken)
  let dragY = null;
  panel.addEventListener('touchstart', (e) => {
    if (!panel.classList.contains('dropdown--sheet')) return;
    if (e.target === grabber || list.scrollTop <= 0) dragY = e.touches[0].clientY;
  }, { passive: true });
  panel.addEventListener('touchmove', (e) => {
    if (dragY === null) return;
    const dy = Math.max(0, e.touches[0].clientY - dragY);
    panel.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  panel.addEventListener('touchend', (e) => {
    if (dragY === null) return;
    const dy = e.changedTouches[0].clientY - dragY;
    dragY = null;
    if (dy > 80) close(); else panel.style.removeProperty('transform');
  });

  const choose = (code) => {
    setSelectValue(select, code);
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
  if (!openDropdown || openDropdown.select.contains(e.target) || openDropdown.panel.contains(e.target)) return;
  if (e.target === sheetOverlay) return; // overlay kendi click'iyle kapatır
  openDropdown.close(false);
});

// Kırılım değişirse (döndürme vb.) açık dropdown kapanır — sheet/popover arası geçiş temiz kalsın
onBreakpointChange(closeOpenDropdown);
