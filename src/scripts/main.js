/**
 * Sabah Finans — giriş noktası (framework'süz, ES module)
 *
 * İlk görünüm derlenmiş HTML'de hazırdır (SEO + JS'siz kullanım; bkz. scripts/build.mjs).
 * Her özellik features/ altında kendi modülündedir ve markup'ı components/ şablonlarından üretir;
 * böylece bir component'ın HTML'i hem derlemede hem etkileşimde tek yerden gelir.
 * Canlı ortamda data.js / content.js yerine API yanıtı kullanılır; şablonlar aynı kalır.
 */
import { initTabs } from './features/tabs.js';
import { initHeadlineSlider } from './features/headline-slider.js';
import { initBreakingNews } from './features/breaking-news.js';
import { initConverter } from './features/converter.js';
import { initMoney } from './features/money.js';
import { initBist } from './features/bist.js';
import { initCrypto } from './features/crypto.js';
import { initStickySidebar } from './features/sidebar.js';
import { initSearch } from './features/search.js';
import { startLive } from './live.js';

initTabs();
initHeadlineSlider();
initBreakingNews();
initConverter();
initMoney();
initBist();
initCrypto();
initStickySidebar();
initSearch();
startLive({ onUpdate: (detail) => document.dispatchEvent(new CustomEvent('livedata', { detail })) });
