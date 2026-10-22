# Sabah Finans — Anasayfa Redesign

Sabah Finans sayfasının yeniden tasarımı için hazırlanan case study'nin **HTML çıktısı**.
Tasarım, design system ve tüm responsive ekranlar Figma'dadır; bu repo o tasarımın
Design System token'ları ve component'leri kullanılarak semantik, responsive HTML/CSS'e aktarılmış halidir.

| | |
|---|---|
| **Canlı site** | <https://pelinaydemir.github.io/sabah-finans/> |
| **Figma dosyası** | [proje-x](https://www.figma.com/design/Obf50BFcksCZuXTvLtuLkZ/proje-x?node-id=78-102655) |
| **Anasayfa ekranları** | [Screens (1920 / 768 / 375)](https://www.figma.com/design/Obf50BFcksCZuXTvLtuLkZ/proje-x?node-id=214-24330) |
| **Tasarım kararları** | [UX analizi ve kararlar](https://www.figma.com/design/Obf50BFcksCZuXTvLtuLkZ/proje-x?node-id=179-20872) |
| **Tasarım & geliştirme** | [Pelin Aydemir](https://github.com/pelinaydemir) |
| **Geliştirici teslim notları** | [`HANDOFF.md`](HANDOFF.md) |

---

## Çalıştırma

Framework ve bağımlılık yoktur. Herhangi bir statik sunucu yeterlidir
(ikon sprite'ı `<use href>` ile harici dosyadan okunduğu için `file://` yerine sunucu gerekir).

```bash
python3 -m http.server 5173
```

Ardından `http://localhost:5173` adresini açın.

### Sayfayı derleme

`index.html` **derlenmiş çıktıdır**, elle düzenlenmez. Tekrar eden her liste (haber kartları, ticker'lar,
KAP satırları, tablo satırları …) Figma'daki gibi tek bir component şablonundan üretilir:

```bash
node scripts/build.mjs
```

İskelet `src/page.html` (tekrar eden yerlerde `<!-- @render ad -->` işareti), şablonlar
`src/scripts/components/`, içerik `src/scripts/content.js` (editoryal) ve `src/scripts/data.js` (piyasa).
Tarayıcı da etkileşimde aynı şablonları kullanır; bir component'ın HTML'i tek yerde yazılıdır.
Çıktı statik ve SEO dostudur; GitHub Pages `index.html`'i doğrudan sunar (Node 18+ yalnızca derlemede gerekir).

## Teknoloji tercihi

- **HTML5 + CSS (custom properties) + vanilla JS.** Case'te teknoloji serbest bırakıldığı için
  çıktının herhangi bir stack'e (React, Vue, CMS şablonu) taşınabilmesi önceliklendirildi:
  token'lar CSS değişkeni, component'ler BEM sınıfı olarak birebir taşınabilir.
- **Ekstra kütüphane yok.** Tüm görsel değerler Figma Variables & Styles'tan gelir.
- **Component = şablon fonksiyonu.** Figma'da bir component bir kez çizilip instance'larla kullanıldığı gibi,
  kodda da her component'ın HTML'i `src/scripts/components/` altında tek fonksiyondur; sayfa derlemesi ve
  JS etkileşimleri aynı fonksiyonu çağırır (bkz. HANDOFF.md › Kod mimarisi).
- **JS yalnızca etkileşim içindir** (tab seçimi, manşet sayfalama, çevirici, mobil arama).
  JS yüklenmese de sayfa içerik olarak eksiksizdir.

## Klasör yapısı

```
index.html                    Derlenmiş anasayfa (elle düzenlenmez — scripts/build.mjs üretir)
scripts/build.mjs             page.html + components + içerik → index.html
src/
├── page.html                 Sayfa iskeleti (semantik HTML, Figma node referanslı yorumlar, @render işaretleri)
├── styles/
│   ├── main.css              Giriş noktası (@import sırası: token → base → layout → component)
│   ├── tokens.css            Figma Variables → CSS custom properties (+ Desktop/Tablet/Mobile modları)
│   ├── base.css              Reset + Figma Text Style sınıfları (.t-h6-semibold …)
│   ├── layout.css            Sayfa ızgarası ve tablet/mobil içerik sıralaması
│   └── components/           Her dosya bir Figma component'ine karşılık gelir
├── scripts/
│   ├── main.js               Giriş noktası (yalnızca özellikleri başlatır)
│   ├── components/           Figma component'larının HTML şablonları (atoms · news · market · lists · widget)
│   ├── features/             Etkileşimler — her widget/özellik ayrı modül (slider, dropdown, arama …)
│   ├── core/                 Ortak yardımcılar: biçimlendirme (tr-TR), DOM/kırılım, varlık yolları
│   ├── content.js            Editoryal örnek içerik (haberler, KAP, raporlar, menü)
│   ├── data.js               Piyasa örnek verisi (kurlar, coin'ler, hisseler)
│   └── live.js               Canlı veri katmanı
└── assets/
    ├── icons/sprite.svg      Vuesax ikonları (currentColor → token ile renklenir)
    ├── logos/                Logo/Currency, Logo/Company, marka logosu
    ├── charts/               Sparkline ve bar grafik export'ları
    ├── images/               Haber görselleri
    └── campaign/                  Reklam yer tutucuları
```

## Kurallar (kısaca)

- Component'ler **yalnızca semantic token** kullanır (`--color-text-primary`, `--radius-lg-plus` …);
  ham hex/px değeri component CSS'inde yer almaz (Figma'daki 1:1 ölçüler hariç, yorumla belirtilmiştir).
- Tipografi HTML'de **Figma Text Style adıyla** uygulanır: `Heading/H6/Semibold` → `.t-h6-semibold`.
- Sınıf isimleri **BEM**: `.block__element--modifier`; blok adı Figma component adıyla eşleşir.
- Responsive tipografi, Figma'daki **"Typography · Scale"** modlarıyla aynı şekilde
  değişkenlerin media query içinde yeniden tanımlanmasıyla yapılır — component CSS'i değişmez.

Ayrıntılı token tablosu, component ↔ Figma eşlemesi, breakpoint davranışları ve
geliştiriciye açık konular için: **[HANDOFF.md](HANDOFF.md)**
