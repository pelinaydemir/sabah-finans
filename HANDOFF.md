# Geliştirici Teslim Notları (Hand-off)

Bu doküman Figma ile kod arasındaki köprüdür. Her bölüm, ilgili Figma node'una
link verir; kodda aynı node ID'leri HTML yorumlarında ve CSS dosya başlıklarında geçer.

Figma: <https://www.figma.com/design/Obf50BFcksCZuXTvLtuLkZ/proje-x>

---

## 1. Breakpoint'ler

| Ad | Aralık | Figma frame | İçerik genişliği | Kenar boşluğu |
|---|---|---|---|---|
| Mobile | 0 – 767px | `Anasayfa - 375w` (154:44790) | fluid (343 @375) | 16px |
| Tablet | 768 – 1279px | `Anasayfa - 768w` (157:50557) | fluid (720 @768) | 24px |
| Desktop | ≥ 1280px | `Anasayfa - 1920W` (140:68268) | maks. 1400 (1045 + 20 + 335) | 40px |

Desktop'ta ana kolon fluid'dir; 1280–1440 arasında daralır, 1400'ü geçmez.

## 2. Design token'lar

Kaynak: Figma **Variables** → `src/styles/tokens.css`. İki katman vardır:

- **Primitive** (`--brand-primary-500`, `--neutral-150`, `--green-500` …) — yalnızca semantic katman içinde kullanılır.
- **Semantic** (`--color-*`) — component'lerin kullandığı tek katman.

### Renk (semantic)

| Token | Değer | Kullanım |
|---|---|---|
| `--color-bg-brand-strong` | `#0c0f3a` | Header, son dakika, birincil buton, seçili tab göstergesi |
| `--color-bg-brand` | `#292f89` | Footer |
| `--color-bg-accent` | `#d51317` | Son dakika ayırıcı nokta |
| `--color-bg-positive-strong` | `#027a48` | Beyaz metinli yeşil yüzey (CANLI BORSA) |
| `--color-bg-surface` | `#ffffff` | Kart yüzeyleri |
| `--color-bg-subtle` | `#f2f2f2` | Yan kolon paneli, badge, tablo başlığı |
| `--color-bg-canvas` | `#fafafa` | Tablet/mobil sayfa zemini |
| `--color-bg-positive` / `-subtle` | `#12b76a` / `#ecfdf3` | Artış ikonu / artış pill |
| `--color-bg-negative` / `-subtle` | `#f04438` / `#fef3f2` | Düşüş ikonu / düşüş pill |
| `--color-text-primary` | `#111722` | Başlık, değer |
| `--color-text-secondary` | `#404040` | Gövde metni |
| `--color-text-tertiary` | `#737373` | Meta, zaman, etiket |
| `--color-text-brand` | `#292f89` | Overline, seçili nav-number, KAP tarihi |
| `--color-text-positive` / `-negative` | `#027a48` / `#d92d20` | Değişim değerleri |
| `--color-border-default` | `#ebebeb` | Ayraçlar, kart çerçevesi |
| `--color-border-strong` | `#d4d4d4` | Input çerçevesi |

> Erişilebilirlik: pozitif/negatif **metin** renkleri (`#027a48`, `#d92d20`) beyaz zeminde WCAG AA (4.5:1) kontrastını sağlar;
> daha açık `bg-positive/negative` tonları yalnızca ikon zemini ve grafik için kullanılır.

### Tipografi

Aileler: **Epilogue** (display/heading) · **Google Sans Flex** (body/numeric). Google Fonts'tan yüklenir.

| Figma Text Style | CSS sınıfı | Desktop | Tablet | Mobile |
|---|---|---|---|---|
| Display/Large/Bold | `.t-display-bold` | 40/48 | 40/48 | — (manşet H3'e düşer) |
| Heading/H2/Semibold | `.t-h2-semibold` | 28/36 | 24/32 | 24/32 |
| Heading/H3/Bold · Semibold | `.t-h3-bold` · `.t-h3-semibold` | 24/32 | 24/32 | 20/28 |
| Heading/H5/Semibold | `.t-h5-semibold` | 18/24 | 18/24 | 16/24 |
| Heading/H6/Semibold · Medium | `.t-h6-semibold` · `.t-h6-medium` | 16/24 | 16/24 | 16/24 |
| Body/L/Semibold | `.t-body-l-semibold` | 18/28 | 16/24 | 16/24 |
| Body/M · S · XS (Regular/Medium/Semibold) | `.t-body-{m,s,xs}-{regular,medium,semibold}` | 16/24 · 14/20 · 12/16 | aynı | aynı |
| Numeric/M/Semibold | `.t-numeric-m-semibold` | 16/24 | aynı | aynı |
| Overline | `.t-overline` | 12/16, +6%, uppercase | aynı | aynı |

Letter-spacing Figma'daki yüzde değerlerinden `em`'e çevrilmiştir (heading %1 → `0.01em`, display -%2 → `-0.02em`).

### Radius · Effect · Spacing

| Token | Değer | Figma |
|---|---|---|
| `--radius-lg` | 8px | radius/lg |
| `--radius-xl` | 10px | radius/xl |
| `--radius-lg-plus` | 12px | radius/lg-plus (kartlar) |
| `--radius-pill` | 99px | radius/pill · radius-button |
| `--radius-full` | 999px | radius/full |
| `--shadow-card` | 5 katmanlı gölge | Effect style "Tab" |

Spacing token'ları (`--space-1` = 4px … `--space-16` = 64px) Figma auto-layout gap/padding değerlerinden türetilmiştir;
Figma'da değişken olarak tanımlı değildir. Figma'ya `spacing/*` koleksiyonu eklenmesi önerilir.

## 3. Component eşlemesi

| Figma component | Node | Kod (sınıf / dosya) | Varyant → modifier |
|---|---|---|---|
| Layout/Header | 154:44034 | `.site-header` · `header.css` | Cihaz=Desktop/Tablet/Mobile → media query |
| Layout/Son Dakika Akışı | 154:44049 | `.breaking-news` · `breaking-news.css` | Mobile'da oklar gizli |
| Layout/Finans Barı + Finance/Ticker | 154:44071 · 95:58443 | `.market-bar`, `.ticker` · `market-bar.css` | — |
| Chart/Sparkline | — | `.sparkline--up / --down` | düşüş = yatay çevrilmiş grafik |
| Navigation/Tab | 98:33256 | `.tab--lg / --sm`, `.is-selected` | Seçili · Boyut |
| Section/Başlık | 95:84384 | `.section-title` · `section-title.css` | — |
| Haber Kartı/Görsel Üzeri | 93:57769 | `.news-hero` · `top-stories.css` | Mobile: başlık H3 |
| Navigation/Sayfa Numarası | 95:67706 | `.nav-number[aria-current]` | Seçili=Evet/Hayır |
| Card/Haber | 98:33364 | `.card-featured` · `--compact` | Görsel = Var / Yok |
| Chip/Hisse | 95:67467 | `.ticker-chip` · `--solid` | görsel üzerinde dolu |
| Logo/Currency | 117:35656 | `.logo-currency--{18,20,24,32}` | boyut |
| Logo/Company | 123:34961 | `.logo-company--{16,20,40}` | boyut |
| Widget/Piyasa Özeti | 152:43463 | `.widget` + `.market-row` · `widget.css` | Cihaz |
| Widget/Paramın Karşılığı Ne Olurdu? | 152:43567 | `.widget` + `.money` | Cihaz |
| Widget/Döviz ve Altın Çevirici | 150:44309 | `.converter`, `.field`, `.currency-select` | Mobile: alanlar alt alta |
| Widget/BIST Öne Çıkanlar | 152:43642 | `.stock-tiles`, `.breadth`, `.ratio-bar` | Cihaz |
| Widget/Hisse İstatistikleri | 152:43687 | `.legend`, `.stats` | Cihaz |
| Dropdown/Para Birimi + Dropdown/Item | 127:36908 · 127:36907 | `.dropdown`, `.dropdown-item` · `dropdown.css` | Durum = Default / Hover / Seçili · kompakt varyant: `.dropdown--compact` |
| Widget/Seans Raporu / Raporlar ve Analizler | 153:43490 | `.reports`, `.report-row` · `reports.css` | Tip=Seans Raporu / Analiz → `--analysis` |
| List/KAP Satırı | 125:36204 | `.kap-row`, `.date-block` · `kap.css` | — |
| Widget/Kripto Paralar | 153:43693 | `.crypto-table` · `crypto.css` | Mobile: Yüksek/Düşük gizli |
| Sidebar/Ad Banner | 95:81139 | `.campaign-side` · `campaign.css` | — |
| Layout/Footer | 154:44149 | `.site-footer` · `footer.css` | Cihaz |

### Figma dosya düzeni

- **Component adları** `Kategori/Ad` biçimindedir: `Layout/*`, `Navigation/*`, `Section/*`, `Card/*`, `Chip/*`, `List/*`, `Dropdown/*`, `Widget/*`, `Logo/*`, `Finance/*`, `Button`.
- **Varyant özellikleri** Türkçe ve tutarlıdır: `Cihaz`, `Seçili = Evet/Hayır`, `Boyut`, `Görsel = Var/Yok`, `Tip`, `Durum`.
- **Ekran katmanları** koddaki sınıf adlarıyla aynıdır (kebab-case): `top-stories`, `headline-slider`, `news-columns`, `news-column/gundem`, `story-list`, `sidebar`, `sidebar-divider`, `crypto-news`, `ad-inline`…
- Her component'in açıklamasında **Ne için / Varyantlar / Kullanım / Kod** başlıkları ve bu dokümana bağlantı bulunur.

## 4. Responsive davranış (yalnız boyut değil, içerik)

| Bölüm | Desktop | Tablet | Mobile |
|---|---|---|---|
| Üst reklam | 970×250 | 728×90 | 300×256 (`<picture>`) |
| Header arama | 710px ortalanmış input + açılır panel (2 kolon) | ikon → tam ekran arama görünümü (geri butonu / cihaz geri tuşu) | aynı |
| CANLI BORSA | ikon + metin (Body/L) | ikon + metin (16px) | yalnız metin, 32px |
| Finans barı | Finance/Ticker · Boyut=Varsayılan | aynı | Boyut=Kompakt: bar 100px (padding 8/6, etiket Body/S, sparkline 70×46) |
| Kategori tab'ları | ortalanmış | sola hizalı, yatay kaydırma | aynı |
| Manşet | otomatik dönen slider, 10'lu numara + ilerleme halkası, 5 haber yan listede | 4:3 kart karoseli (Figma 188:25592): komşu kartlar 8px aralıkla görünür, altta nokta; altında 3 haber | aynı, başlık H3 |
| Yan kolon | ayrı kolon (gri panel) | akışa karışır, her widget kendi gri panelinde | aynı |
| Haber kolonları | 3 kolon | alt alta, Piyasa Özeti'nden sonra | aynı |
| Çevirici | alanlar yan yana, swap ⇄ | alanlar alt alta, swap ⇅, tam genişlik buton | aynı |
| Seans / Raporlar | 2 kolon, 4'er satır | 2 kolon, 4'er satır | alt alta, 3'er satır |
| KAP Duyuruları | 2 kolon (10 kayıt) | 2 kolon | 1 kolon (5 kayıt) |
| Kripto tablosu | 5 kolon | 5 kolon | Coin / Fiyat / 24 Saat |
| Kripto Haberleri | 3 kolon | yatay kaydırma, 300px kart | yatay kaydırma, 280px kart |
| İç reklamlar | 2× 728×90 + yan kolonda 2× 300×256 | yok | akışta 2× 300×256 |
| Footer yasal metin | tam | kısaltılmış + "Daha fazla…" | aynı |

İçerik sırası tablet/mobilde `layout.css` içindeki `[data-slot]` → `order` tablosuyla yönetilir.
Yeni bir blok eklenirken `data-slot` verip bu tabloya eklemek yeterlidir.

## 5. Etkileşim durumları

| Öğe | Durum | Uygulama |
|---|---|---|
| Tab | seçili | `.is-selected` + `aria-selected="true"`; ←/→ ile klavye gezinmesi |
| nav-number | seçili / hover | `aria-current="true"`; üzerine gelmek manşeti değiştirir. Halka (`.nav-number__ring`) sıradaki manşete kalan süreyi gösterir (JS → `--progress`) |
| Manşet | otomatik geçiş | 6 sn (`AUTOPLAY_MS`). Fare manşet kartının üzerindeyken, klavye odağı slider'dayken, dokunurken, sekme arka plandayken veya slider ekranda değilken durur; `prefers-reduced-motion` ile kapalı |
| Son dakika | otomatik kayma + oklar | Yalnız desktop: 30px/sn kayar, oklar bir haber ileri/geri alır. Tablet/mobilde otomatik kayma kapalı (dokunmatik kaydırmayla çakışır); şerit parmakla kaydırılır ve her başlıkta durur (scroll-snap), tablet okları bir başlık ilerletir |
| Arama | odak / yazıyor / sonuç yok | Varsayılan: son aramalar (localStorage) + en çok arananlar + popüler haberler. Yazarken semboller ve haberler filtrelenir, eşleşme `<mark>` ile vurgulanır. ↑/↓, Enter, Esc; `X` alanı temizler. Figma: “Arama · Search” bölümü |
| Kartlar, rapor/KAP satırları | hover | başlık `--color-text-brand`; tüm satır tıklanabilir (stretched link) |
| ticker-chip | hover | çerçeve `--color-border-strong` |
| stock-tile, kripto satırı | hover | zemin `--color-bg-brand-subtle` (çerçeve değişmez) |
| Butonlar | hover | `brightness(1.08)`; `btn--primary` (koyu lacivert) için zemin `--color-bg-brand`'e geçer, ok 2px kayar |
| Input | focus | çerçeve `--color-border-brand` |
| Tümü | focus-visible | 2px `--color-border-brand` outline |

Figma'da hover/focus varyantı yalnızca `Dropdown/Item` için tanımlı; diğerleri yukarıdaki minimal
kurallarla eklendi. Tasarım tarafında onaylanması önerilir.

## 6. Erişilebilirlik

- Landmark'lar: `header`, `nav` (kategoriler, footer), `main`, `aside` (yan kolon, reklamlar), `footer`.
- Sayfada tek `h1` (görsel olarak gizli); bölüm başlıkları `h2`, kart başlıkları `h3`.
- Kripto verisi gerçek `<table>` (caption, `scope`); istatistikler `<dl>`.
- Dekoratif ikon/grafikler `aria-hidden`; oran çubukları `role="img"` + açıklayıcı `aria-label`.
- "İçeriğe geç" bağlantısı, `prefers-reduced-motion` desteği.

### Erişilebilirlik kontrolü (axe-core 4.10, WCAG 2.2 AA + best practice)

Desktop, tablet ve mobilde **0 ihlal**. Bu tur için yapılan token/component değişiklikleri (Figma'da da uygulandı):

| Bulgu | Önce | Sonra |
|---|---|---|
| CANLI BORSA (beyaz metin) | `bg/positive` Green/500 — 2,62:1 | yeni `bg/positive-strong` → Green/700 — 5,4:1 (grafik/nokta gibi metinsiz yüzeyler Green/500'de kalır) |
| Negatif değişim metni (change-pill vb.) | `text/negative` Red/600 — Red/50 üzerinde 4,44:1 | Red/700 — 5,9:1 |
| Kripto tablo başlığı | `text/tertiary` bg-subtle üzerinde 4,23:1 | `text/secondary` — 9,2:1 |
| Manşet noktaları (tablet/mobil) | 16×16 dokunma alanı | 24×24 (WCAG 2.5.8); görünen nokta aynı, aralık 16px |

## 7. Veri entegrasyonu notları

Tüm veriler Figma'daki örnek içeriktir; canlı veriye bağlanırken:

- **Değişim göstergesi**: `change--up` / `change--down` sınıfı işarete göre seçilir.
- **Oran çubukları**: segment genişliği inline `style="--value: N"` ile verilir (`flex-grow`).
- **Sparkline / bar grafikleri** şu an Figma export'u statik SVG'dir. Canlı veride aynı kutu
  ölçüleriyle (`.sparkline` 78×51, `.money-row__bar` 80×56) üretilen `<svg>` ile değiştirilmelidir.
- **Kripto avatarları**: logosu olmayan coin'ler için harf avatarı, renk `--coin-color` ile verilir.
- **Çevirici**: `data-rate` attribute'u kur değeridir; para birimi dropdown'u Figma
  `Dropdown/Para Birimi` (127:36908) ve `Durum / Dropdown açık` (164:19700) ekranına göre eklenmelidir.
- **Arama**: `main.js › buildSearchIndex` sembolleri `stocks`, `currencies` ve `coins`'ten, haberleri
  `headlines`'tan üretir. Canlı ortamda `GET /search?q=` yanıtı aynı şablonlara (`symbolItem`, `newsItem`)
  verilir; istek sürerken panelde mevcut sonuçlar korunmalı, ağ hatasında “Sonuç yok” yerine yeniden dene mesajı gösterilmelidir.
- **Reklamlar**: `.campaign-*` kapları sabit ölçülü yer tutuculardır; ad server slot'larıyla değiştirilir. Sınıf ve dosya adları bilinçli olarak `ad-*`/`ads/` yerine `campaign` seçildi: reklam engelleyiciler bu kalıpları gizlediği için demo sitede reklam alanları görünmüyordu.

## 8. Figma'dan bilinçli sapmalar

| Konu | Figma | Kod | Neden |
|---|---|---|---|
| "Etherium" | yazım hatası | "Ethereum" | içerik düzeltmesi |
| Kategori "Kap" | Kap | KAP | kısaltma |
| Logo rengi | instance override (beyaz) | `logo-finans-inverse.svg` | export ana component rengini (#292F89) veriyordu |
| Para birimi logoları | export'ta çerçeve zemini | dairesel kırpma | export artefaktını gizlemek için |
