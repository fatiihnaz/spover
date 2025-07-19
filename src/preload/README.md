# Güvenlik Modülü

Bu modül, Electron uygulamasında güvenlik önlemlerini sağlar.

## Özellikler

### 🛡️ **Engellenen Kısayollar**
- **DevTools**: F12, Ctrl+Shift+I/J/C (Windows), Cmd+Alt+I/J/C (Mac)
- **Refresh**: F5, Ctrl+R, Ctrl+Shift+R (Windows), Cmd+R, Cmd+Shift+R (Mac)  
- **Tehlikeli Kısayollar**: Ctrl+U (View Source), Ctrl+H (History), Ctrl+W (Close), Ctrl+Q (Quit)

### 🚫 **Devre Dışı Özellikler**
- Sağ tık menüsü (Context Menu)
- Console log metodları (production'da)
- DevTools açılma tespiti

## Kullanım

```javascript
const { initSecurity } = require('./security');

// Production modunda otomatik aktif
initSecurity();

// Development modunda da test etmek için
initSecurity(true);
```

## Dosya Yapısı

- `security.js` - Ana güvenlik modülü
- `index.js` - Preload dosyası (temiz tutuldu)

## Güvenlik Seviyeleri

1. **Preload Seviyesi** ✅ - En etkili (mevcut)
2. **Main Process** ✅ - windows.js'te devTools: false
3. **Global Shortcuts** ✅ - windows.js'te globalShortcut.register
4. **CSS Seviyesi** ✅ - user-select: none

Bu multi-layered yaklaşım maksimum güvenlik sağlar.
