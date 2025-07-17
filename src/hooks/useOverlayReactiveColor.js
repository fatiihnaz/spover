/******************************************************************************************
 * src/hooks/useOverlayReactiveColor.js
 *
 * Görselden (albüm kapağı vb.) hâkim “vibrant” rengi çıkarır.
 *
 * Parametreler:
 *  - imageUrl: string   // İşlenecek görsel URL’si
 *  - fallback: string   // Renk bulunamazsa dönecek hex (varsayılan: Spotify yeşili)
 *
 * Özellikler:
 *  - imageUrl değişince dinamik import('node-vibrant') ile palet hesaplar.
 *  - Vibrant ya da Muted swatch’ın hex değeri bulunur; yoksa fallback kullanılır.
 *  - Cleanup sırasında hesaplama iptal edilir.
 *
 * Döndürdüğü değer:
 *  - color: string      // '#rrggbb' formatında hâkim renk
 *
 * Kullanımı:
 *  const color = useVibrantColor(now.item.album.images[0]?.url);
 ******************************************************************************************/

import { useState, useEffect } from 'react';

export default function useVibrantColor(imageUrl, fallback = '#1db954') {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;

    import('node-vibrant')
      .then(({ default: Vibrant }) => Vibrant.from(imageUrl).getPalette())
      .then(pal => {
        if (cancelled) return;
        const vib = pal?.Vibrant?.hex || pal?.Muted?.hex;
        if (vib) setColor(vib);
      })
      .catch(() => {/* ignore */ });

    return () => { cancelled = true; };
  }, [imageUrl, fallback]);

  return color;
}
