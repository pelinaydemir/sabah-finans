/**
 * TAB GRUPLARI — [role="tablist"]
 * Seçim + ←/→ klavye; `tabchange` olayıyla ilgili widget'a haber verir (bkz. core/dom.js › onTab).
 */
export function initTabs() {
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panel = document.getElementById(list.dataset.controls);
    tabs.forEach((t) => {
      t.id ||= `${list.dataset.tabs}-tab-${t.dataset.tab}`;
      if (panel) t.setAttribute('aria-controls', panel.id);
    });
    const label = () => panel?.setAttribute('aria-labelledby', tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.id);
    label();

    const select = (tab, focus = true) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.classList.toggle('is-selected', selected);
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      if (focus) tab.focus();
      label();
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
