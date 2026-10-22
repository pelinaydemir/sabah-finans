/**
 * SON DAKİKA AKIŞI
 * Desktop      : yavaş otomatik kayma (30px/sn), hover/odakta durur. Oklar şeridi
 *                bir haber ileri/geri alır, sonra otomatik kayma sürer. Döngü
 *                kesintisizdir: liste bir kez kopyalanır, sona gelince başa sarar.
 * Tablet/Mobil : otomatik kayma ve ok YOK — dokunmatikte parmakla kaydırma ile
 *                çakışır (WCAG 2.2.2). Şerit doğal yatay kaydırılır, her başlıkta
 *                durur (scroll-snap).
 * Hareketi azalt: desktop'ta otomatik kayma kapalıdır; oklar şeridi bir başlık kaydırır.
 */
import { isDesktop, onBreakpointChange, reducedMotion } from '../core/dom.js';

export function initBreakingNews() {
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

  /* Otomatik kayma kapalıyken (hareketi azalt): doğal kaydırmayla bir başlık ileri/geri */
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

  const sync = () => (isDesktop() ? start() : stop());
  onBreakpointChange(sync);
  sync();
}
