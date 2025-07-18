/******************************************************************************************
 * src/hooks/useConfig.js
 *
 * Uygulamanın ayarlarını (position, opacity, scale, bgMode, vb.) yönetmek için
 * bir React hook’u. Electron renderer’dan main-process’e yapılan okuma/yazma senkronizasyonunu otomatik hale getirir.
 *
 * Özellikler:
 *  - İlk mount’ta window.settings.get() ile diskten ayarları yükler.
 *  - window.settings.onChange() ile main-process’ten gelen güncellemeleri dinler.
 *  - React state (cfg) değiştikçe window.settings.set() ile JSON dosyasını günceller.
 *  - Döngüsel güncellemeleri skipNextSaveRef ile engeller.
 *
 * Döndürdüğü değerler:
 *  - cfg:    Geçerli konfigürasyon objesi
 *  - setCfg: Konfigürasyonu güncellemek için React state setter
 *
 * Kullanımı:
 *  const [cfg, setCfg] = useConfig();
 ******************************************************************************************/

import { useState, useEffect, useRef } from 'react';

const defaults = {
  pos:         { x: 0, y: 0 },
  opacity:     0.8,
  scale:       1,
  bgColor:     '#121212',
  colorMode:   'static', // 'static', 'light-muted', 'muted', 'dark-muted'
  staticType:  'solid',  // 'solid', 'gradient' - statik modda düz renk mi gradyan mı
  showCurrent: true,
  showBPM:     false,
  showNext:    true,
  showPlaylist:false,
};

export default function useConfig() {
  const [cfg, setCfg]   = useState(defaults);
  const lastSavedJson   = useRef(JSON.stringify(defaults));
  const skipNextSaveRef = useRef(false);

  useEffect(() => {   // İlk render’da ve main-process’ten gelen ayar değişimlerinde state’i güncelle
    (async () => {
      const stored = await window.settings.get();
      lastSavedJson.current = JSON.stringify(stored);
      setCfg(prev => ({ ...prev, ...stored }));
    })();

    const off = window.settings.onChange(data => {
      skipNextSaveRef.current = true; // React→settings döngüsünü kır
      lastSavedJson.current = JSON.stringify(data);
      setCfg(prev => ({ ...prev, ...data }));
    });
    return () => off && off();
  }, []);

  useEffect(() => {
    if (skipNextSaveRef.current) { // React state değiştiğinde settings.json’a kaydet
      skipNextSaveRef.current = false;
      return;
    }
    const json = JSON.stringify(cfg);
    if (json !== lastSavedJson.current) {
      window.settings.set(cfg);
      lastSavedJson.current = json;
    }
  }, [cfg]);

  return [cfg, setCfg];
}