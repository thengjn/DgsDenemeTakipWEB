# 🌐 DGS Deneme Takip - Web Versiyonu

Bu klasör, DGS Deneme Takip uygulamasının web versiyonunu içerir ve GitHub Pages üzerinde çalışır.

## Live Version: https://thengjn.github.io/DgsDenemeTakipWEB/

## 📂 Dosyalar

- `index.html` - Ana sayfa ve tüm HTML yapısı
- `script.js` - JavaScript logic ve veri yönetimi
- `README.md` - Bu dosya

## 🚀 Hızlı Başlangıç

### Yerel Geliştirme

```bash
# Basit HTTP sunucusu başlatın
python -m http.server 8000

# Tarayıcıda açın
http://localhost:8000
```

### GitHub Pages Deployment

1. Repository ayarlarında Pages sekmesine gidin
2. Source: "Deploy from a branch"
3. Branch: "main"
4. Folder: "/web"

## 🛠️ Özellikler

### Responsive Design
- **Desktop**: Tam özellik seti
- **Tablet**: Optimize edilmiş layout
- **Mobile**: Touch-friendly interface

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Vanilla JavaScript (framework yok)
- Chart.js CDN'den yüklenir
- LocalStorage ile veri kalıcılığı

## 📱 Kullanım

### Deneme Ekleme
1. Form alanlarını doldurun
2. Sayısal ve sözel sonuçları girin
3. "Deneme Ekle" butonuna tıklayın

### Grafikler
- Minimum 2 deneme gereklidir
- Otomatik olarak responsive
- Gerçek zamanlı güncelleme

### Veri Yönetimi
- Veriler tarayıcı localStorage'da saklanır
- Otomatik kaydetme
- Silme işlemi onay ile

## 🎯 Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 1200px) { ... }

/* Mobile */
@media (max-width: 768px) { ... }

/* Small Mobile */
@media (max-width: 480px) { ... }
```

## 🔧 Geliştirme

### Kod Yapısı
```javascript
class DgsTracker {
    constructor()     // Başlangıç
    setupEventListeners()  // Event binding
    updateDisplay()   // UI güncelleme
    initializeCharts() // Grafik başlatma
    handleResize()    // Responsive handling
}
```

### Veri Formatı
```javascript
{
    id: timestamp,
    examName: "string",
    examDate: "YYYY-MM-DD",
    numericalNet: number,
    verbalNet: number,
    overallNet: number,
    // ...
}
```

## 🔄 Güncellemeler

### v1.0.0
- ✅ Responsive tasarım
- ✅ Grafik desteği
- ✅ Geri sayım timer
- ✅ Veri kalıcılığı

### Gelecek Sürümler
- PWA (Progressive Web App)
- Dark mode
- Veri export/import
- Offline çalışma

## 📞 Destek

Web versiyonu ile ilgili sorunlar için:
- GitHub Issues
- Pull Request

---

**Web versiyonu GitHub Pages'te çalışır! 🌐** 
