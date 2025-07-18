/******************************************************************************************
 * src/hooks/useOverlayReactiveColor.js
 *
 * Görselden (albüm kapağı vb.) renk paleti çıkarır ve mod'a göre renk döndürür.
 *
 * Parametreler:
 *  - imageUrl: string   // İşlenecek görsel URL'si
 *  - colorMode: string  // 'static', 'light-muted', 'muted', 'dark-muted'
 *  - staticColor: string // statik modda kullanılacak renk
 *
 * Özellikler:
 *  - imageUrl değişince dinamik import('node-vibrant') ile palet hesaplar.
 *  - colorMode'a göre farklı swatch'ları döndürür.
 *  - Cleanup sırasında hesaplama iptal edilir.
 *
 * Döndürdüğü değer:
 *  - color: string      // '#rrggbb' formatında renk
 *
 * Kullanımı:
 *  const color = useReactiveColor(coverUrl, cfg.colorMode, cfg.bgColor);
 ******************************************************************************************/

import { useState, useEffect } from 'react';

export default function useReactiveColor(imageUrl, colorMode = 'static', staticColor = '#1db954') {
  const [color, setColor] = useState(staticColor);

  useEffect(() => {
    if (colorMode === 'static') {
      setColor(staticColor);
      return;
    }

    if (!imageUrl) {
      setColor(staticColor);
      return;
    }

    let cancelled = false;

    import('node-vibrant/browser')
      .then(vibrantModule => {
        // Handle both default and named exports
        const Vibrant = vibrantModule.default || vibrantModule.Vibrant || vibrantModule;
        
        return Vibrant.from(imageUrl, {
          colorCount: 32, // Reduced for performance
          quality: 10     // Lower quality for faster processing
        }).getPalette();
      })
      .then(palette => {
        if (cancelled) return;
        
        let selectedColor = staticColor;
        
        switch (colorMode) {
          case 'light-muted':
            selectedColor = palette?.LightMuted?.hex || palette?.Muted?.hex || palette?.Vibrant?.hex || staticColor;
            break;
          case 'muted':
            selectedColor = palette?.Muted?.hex || palette?.Vibrant?.hex || staticColor;
            break;
          case 'dark-muted':
            selectedColor = palette?.DarkMuted?.hex || palette?.Muted?.hex || palette?.DarkVibrant?.hex || staticColor;
            break;
          default:
            selectedColor = staticColor;
        }
        
        setColor(selectedColor);
      })
      .catch(() => {
        // Silent fallback to static color
        setColor(staticColor);
      });

    return () => { cancelled = true; };
  }, [imageUrl, colorMode, staticColor]);

  return color;
}
