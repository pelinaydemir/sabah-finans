/**
 * Tarayıcı yardımcıları — kırılım, hareket tercihi, içerik değişimi, sekme olayı.
 */

/** Desktop kırılımı (≥1280) — tokens.css ile aynı değer */
const DESKTOP_QUERY = '(min-width: 1280px)';
export const isDesktop = () => matchMedia(DESKTOP_QUERY).matches;
export const onBreakpointChange = (fn) => matchMedia(DESKTOP_QUERY).addEventListener('change', fn);

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** İçerik değişiminde kısa opaklık geçişi (hareketi azalt tercihinde anında) */
export function swapContent(el, html) {
  if (reducedMotion) { el.innerHTML = html; return; }
  el.classList.add('is-updating');
  setTimeout(() => { el.innerHTML = html; el.classList.remove('is-updating'); }, 150);
}

/** Sekme grubunun (data-tabs) değişimini dinler — bkz. features/tabs.js */
export const onTab = (group, handler) => {
  document.querySelector(`[data-tabs="${group}"]`)?.addEventListener('tabchange', (e) => handler(e.detail));
};

/** Canlı veri güncellemesini dinler — bkz. live.js */
export const onLiveData = (handler) => document.addEventListener('livedata', handler);
