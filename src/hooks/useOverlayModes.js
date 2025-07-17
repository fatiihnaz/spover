/******************************************************************************************
 * src/hooks/useOverlayModes.js
 *
 * Overlay’in görsel “mod” listesini yönetir ve Ctrl+O kısayolu ile modlar arasında
 * döngü yapar.
 *
 * Parametre:
 *  - allModes: [{ enabled, Comp, props }]
 *
 * Özellikler:
 *  - enabled=true olan modları filtreler; liste değişince indeks güvenli tutulur.
 *  - window.overlayControl.onCycleMode() ile modlar arasında sırayla geçiş yapılır.
 *
 * Döndürdüğü değerler:
 *  - Active: ReactComponent|null // Seçili mod bileşeni
 *  - props:  object              // Bileşene iletilecek props
 *
 * Kullanımı:
 *  const { Active, props } = useOverlayModes(modList);
 *  return Active && <Active {...props} />;
 ******************************************************************************************/

import { useState, useEffect, useRef } from 'react';

export default function useOverlayModes(allModes) {
  const [idx, setIdx] = useState(0);
  const ref = useRef(allModes);

  const enabled = allModes.filter(m => m.enabled);
  useEffect(() => {
    ref.current = enabled;
    setIdx(i => (enabled.length ? Math.min(i, enabled.length - 1) : 0));
  }, [enabled]);

  /* Ctrl+O dinleyicisi */
  useEffect(() => {
    const unsub = window.overlayControl.onCycleMode(() => {
      setIdx(i => {
        const list = ref.current;
        return list.length > 1 ? (i + 1) % list.length : 0;
      });
    });
    return () => unsub();
  }, []);

  return { Active: enabled[idx]?.Comp, props: enabled[idx]?.props || {} };
}
