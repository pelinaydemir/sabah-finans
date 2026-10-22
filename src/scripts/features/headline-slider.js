/**
 * MANŞET — otomatik dönen slider
 * Desktop : slaytlar üst üste, geçişte çapraz solma. nav-number'ın üzerine
 *           gelince / tıklayınca manşet değişir; aktif numaradaki halka
 *           sıradaki manşete geçişe kalan süreyi gösterir.
 * Tablet/Mobil : yatay kaydırılan karosel (Figma 214:24459) — ortadaki kart
 *           tam boy, komşu kartlar %90,7 ölçekli ve 8px aralıklı; altta nokta.
 * Otomatik geçiş fare/klavye odağı slider'dayken, dokunurken, sekme
 * arka plandayken ve slider ekranda değilken durur (WCAG 2.2.2).
 * "Hareketi azalt" tercihinde otomatik geçiş kapalıdır.
 *
 * Slaytlar derlemede HTML'e yazılır (components/news.js › heroSlide); burada yalnızca davranış var.
 */
import { isDesktop, onBreakpointChange, reducedMotion } from '../core/dom.js';

const AUTOPLAY_MS = 6000;

export function initHeadlineSlider() {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  const track = slider.querySelector('[data-hero-track]');
  const prevBtn = slider.querySelector('[data-slide="prev"]');
  const numbers = [...slider.querySelectorAll('.nav-number')];
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
    // İlk manşette geri gidilecek bir şey yok: "önceki" pasif (Figma: icon-button subtle),
    // sonrakilerde aktif (brand). aria-disabled → odak butonda kalır, klavyeyle kaybolmaz.
    const atStart = current === 0;
    prevBtn?.setAttribute('aria-disabled', String(atStart));
    prevBtn?.classList.toggle('icon-button--subtle', atStart);
    prevBtn?.classList.toggle('icon-button--brand', !atStart);
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
  prevBtn?.addEventListener('click', () => { if (current > 0) go(current - 1); });
  slider.querySelector('[data-slide="next"]')?.addEventListener('click', () => go(current + 1));
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft' && current > 0) go(current - 1);
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
    // Yerleşim henüz hazır değilse (adım 0) hesaplama yapılmaz — aksi halde NaN ile
    // ilk nokta seçimi düşüyordu
    const size = step();
    if (!size) return;
    const f = track.scrollLeft / size;
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

  onBreakpointChange(() => {
    setActive(current);
    if (isCarousel()) { track.scrollTo({ left: current * step() }); paint(); return; }
    slides.forEach((slide) => slide.style.removeProperty('transform'));
  });

  new IntersectionObserver(([entry]) => { hold.offscreen = !entry.isIntersecting; }, { threshold: 0.3 }).observe(slider);

  setActive(0);
  paint();
  if (!reducedMotion) requestAnimationFrame(tick);
}
