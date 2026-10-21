# Sabah Finans — Anasayfa Redesign

Sabah Finans sayfasının yeniden tasarımı için hazırlanan case study'nin **HTML çıktısı**.
Tasarım, design system ve tüm responsive ekranlar Figma'dadır; bu repo o tasarımın
Design System token'ları ve component'leri kullanılarak semantik, responsive HTML/CSS'e aktarılmış halidir.

| | |
|---|---|
| **Canlı site** | <https://pelinaydemir.github.io/sabah-finans/> |
| **Figma dosyası** | [proje-x](https://www.figma.com/design/Obf50BFcksCZuXTvLtuLkZ/proje-x?node-id=78-102655) |
| **Anasayfa ekranları** | [Screens (1920 / 768 / 375)](https://www.figma.com/design/Obf50BFcksCZuXTvLtuLkZ/proje-x?node-id=214-24330) |
| **Prototip** | [4 etkileşim akışı (Present)](https://www.figma.com/proto/Obf50BFcksCZuXTvLtuLkZ/proje-x?node-id=181-22454&starting-point-node-id=181%3A22454&page-id=181%3A22451) |
| **Tasarım kararları** | [UX analizi ve kararlar](https://www.figma.com/design/Obf50BFcksCZuXTvLtuLkZ/proje-x?node-id=179-20872) |
| **Tasarım & geliştirme** | [Pelin Aydemir](https://github.com/pelinaydemir) |
| **Geliştirici teslim notları** | [`HANDOFF.md`](HANDOFF.md) |

---

## Çalıştırma

Build adımı yoktur; framework kullanılmamıştır. Herhangi bir statik sunucu yeterlidir
(ikon sprite'ı `<use href>` ile harici dosyadan okunduğu için `file://` yerine sunucu gerekir).

```bash
python3 -m http.server 5173
```

Ardından `http://localhost:5173` adresini açın.

## Teknoloji tercihi

- **HTML5 + CSS (custom properties) + vanilla JS.** Case'te teknoloji serbest bırakıldığı için
  çıktının herhangi bir stack'e (React, Vue, CMS şablonu) taşınabilmesi önceliklendirildi:
  token'lar CSS değişkeni, component'ler BEM sınıfı olarak birebir taşınabilir.
- **Ekstra kütüphane yok.** Tüm görsel değerler Figma Variables & Styles'tan gelir.
- **JS yalnızca etkileşim içindir** (tab seçimi, manşet sayfalama, çevirici, mobil arama).
  JS yüklenmese de sayfa içerik olarak eksiksizdir.

## Klasör yapısı

```
index.html                    Anasayfa (semantik HTML, Figma node referanslı yorumlar)
src/
├── styles/
│   ├── main.css              Giriş noktası (@import sırası: token → base → layout → component)
│   ├── tokens.css            Figma Variables → CSS custom properties (+ Desktop/Tablet/Mobile modları)
│   ├── base.css              Reset + Figma Text Style sınıfları (.t-h6-semibold …)
│   ├── layout.css            Sayfa ızgarası ve tablet/mobil içerik sıralaması
│   └── components/           Her dosya bir Figma component'ine karşılık gelir
├── scripts/main.js           Etkileşimler
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
