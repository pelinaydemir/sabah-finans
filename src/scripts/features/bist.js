/**
 * BIST ÖNE ÇIKANLAR — Yükselen / Düşen / En Aktif
 */
import { bistLists } from '../data.js';
import { stockTile } from '../components/index.js';
import { onTab, swapContent } from '../core/dom.js';

export function initBist() {
  const tiles = document.querySelector('[data-bist-tiles]');
  if (!tiles) return;
  onTab('bist', (key) => swapContent(tiles, bistLists[key].map(stockTile).join('')));
}
