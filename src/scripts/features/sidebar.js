/**
 * YAN KOLON — panel sonu görünür olduğunda sabitlenir (desktop)
 * Panel ekrandan kısaysa header'ın altında, uzunsa alt kenarı ekranın altında durur.
 */
import { isDesktop } from '../core/dom.js';

export function initStickySidebar() {
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
