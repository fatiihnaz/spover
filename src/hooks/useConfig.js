import { useState, useEffect, useRef } from 'react';

const defaults = {
  pos:         { x: 0, y: 0 },
  opacity:     0.8,
  scale:       1,
  bgMode:      'static',     // aynı Overlay’deki gibi
  bgColor:     '#121212',
  showCurrent: true,
  showBPM:     false,
  showNext:    true,
  showPlaylist:false,
};

export default function useConfig() {
  const [cfg, setCfg]   = useState(defaults);
  const lastSavedJson   = useRef(JSON.stringify(defaults));
  const skipNextSaveRef = useRef(false);

  // 1) İlk yük & main-process’ten gelen güncellemeler
  useEffect(() => {
    (async () => {
      const stored = await window.settings.get();
      lastSavedJson.current = JSON.stringify(stored);
      setCfg(prev => ({ ...prev, ...stored }));
    })();

    const off = window.settings.onChange(data => {
      // Bu veri main-process’ten geldi; kaydetmeye gerek yok
      skipNextSaveRef.current = true;
      lastSavedJson.current = JSON.stringify(data);
      setCfg(prev => ({ ...prev, ...data }));
    });
    return () => off && off();
  }, []);

  // 2) React → settings.json
  useEffect(() => {
    if (skipNextSaveRef.current) {
      // Döngüyü kır
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
