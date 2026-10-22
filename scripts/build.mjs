/**
 * SAYFA DERLEME — src/page.html → index.html
 *
 *   node scripts/build.mjs
 *
 * page.html sayfanın iskeletidir; tekrar eden her liste `<!-- @render ad özellik="değer" -->`
 * işaretiyle yer alır. İşaret, components/ altındaki şablonla ve content.js / data.js'teki
 * veriyle doldurulur. Çıktı (index.html) statik ve SEO dostudur; GitHub Pages doğrudan onu sunar.
 * index.html'i elle düzenlemeyin — değişiklik page.html, şablon veya veride yapılır.
 * Bağımlılık yoktur (Node 18+).
 */
import { readFile, writeFile } from 'node:fs/promises';
import * as content from '../src/scripts/content.js';
import { headlines, moneyAssets, bistLists, coins, cryptoPeriods } from '../src/scripts/data.js';
import {
  breakingItem, ticker, categoryTabs, heroSlide, navNumber, newsCardItem, newsColumn, sectionTitle,
  sessionReportRow, analysisReportRow, kapRow, tabs, cryptoRow, newsCard, marketRow, moneyRows,
  stockTile, footerCol,
} from '../src/scripts/components/index.js';

const root = new URL('..', import.meta.url);

/* İşaret adı → HTML (dizi: her öğe ayrı satıra yazılır) */
const renderers = {
  breakingNews: () => content.breakingNews.map(breakingItem),
  marketBar: () => content.marketBar.map(ticker),
  categories: () => categoryTabs(content.categories),
  heroSlides: () => headlines.map((h, i) => heroSlide(h, i, headlines.length)),
  navNumbers: () => headlines.map(navNumber),
  topStories: () => content.topStories.map(newsCardItem),
  newsColumns: () => content.newsColumns.map(newsColumn),
  sectionTitle: ({ id, title }) => sectionTitle({ id, title }),
  sessionReports: () => content.sessionReports.map(sessionReportRow),
  analysisReports: () => content.analysisReports.map(analysisReportRow),
  kapColumn: ({ index }) => content.kapAnnouncements[index].map(kapRow),
  tabs: ({ set }) => tabs(content.tabSets[set]),
  cryptoRows: () => coins.map((c) => cryptoRow(c, { period: 'daily', range: cryptoPeriods.daily.range })),
  cryptoNews: () => content.cryptoNews.map((c) => `<li>${newsCard(c)}</li>`),
  marketSummary: () => content.marketSummary.map(marketRow),
  moneyRows: () => moneyRows(moneyAssets, { period: 'daily', amount: 1000, symbol: '₺' }),
  bistTiles: () => bistLists.up.map(stockTile),
  footerMenu: () => content.footerMenu.map(footerCol),
};

const MARKER = /^([ \t]*)<!-- @render (\w+)((?:\s+\w+="[^"]*")*) -->$/gm;
const parseAttrs = (text) => Object.fromEntries([...text.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const indent = (html, pad) => html.split('\n').map((line) => (line ? pad + line : line)).join('\n');

const page = await readFile(new URL('src/page.html', root), 'utf8');
const used = new Set();
const html = page.replace(MARKER, (_, pad, name, attrs) => {
  const render = renderers[name];
  if (!render) throw new Error(`Bilinmeyen işaret: @render ${name}`);
  used.add(name);
  const out = render(parseAttrs(attrs));
  return (Array.isArray(out) ? out : [out]).map((item) => indent(item, pad)).join('\n');
});

const unused = Object.keys(renderers).filter((n) => !used.has(n));
if (unused.length) console.warn(`Kullanılmayan şablon: ${unused.join(', ')}`);

const banner = '<!-- Bu dosya derlenir: src/page.html + src/scripts/components → `node scripts/build.mjs`. Elle düzenlemeyin. -->\n';
await writeFile(new URL('index.html', root), html.replace('<!doctype html>\n', `<!doctype html>\n${banner}`));
console.log('index.html güncellendi');
