/******************************************************************************************
 * src/hooks/useOverlayControl.js
 *
 * Overlay’in “Kontrol Modu”nu yönetir.
 *
 * Özellikler:
 *  - window.overlayControl.onEnterCtrl() ile gelen kısayol tetiklendiğinde ctrlMode
 *    true/false’a çevrilir.
 *  - Kontrol moduna girildiğinde rootRef’in boundingRect’i alınarak
 *    window.overlayControl.setControlRegion() ile ana-işleme (main-process) bildirilir.
 *  - CTRL_HIDE_DELAY (10 sn) sonunda pasif kalırsa mod otomatik kapanır.
 *  - armCtrlTimeout() ile bu geri-sayım manuel olarak sıfırlanabilir (örn. hover, klik vs.).
 *
 * Döndürdüğü değerler:
 *  - ctrlMode:       boolean   // Kontrol modunun açık/kapalı durumu
 *  - armCtrlTimeout: () → void // 10 sn’lik zamanlayıcıyı yeniden başlat
 *
 * Kullanımı:
 *  const { ctrlMode, armCtrlTimeout } = useOverlayControl(rootRef);
 ******************************************************************************************/

import { useState, useRef, useEffect, useCallback } from 'react';

const CTRL_HIDE_DELAY = 10_000; // ms

export default function useOverlayControl(rootRef) {
  const [ctrlMode, setCtrlMode] = useState(false);
  const timerRef = useRef(null);

  /* control mode timeout */
  const armCtrlTimeout = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCtrlMode(false);
      window.overlayControl.exitCtrl?.();
    }, CTRL_HIDE_DELAY);
  }, []);

  /* Ctrl-mode giriş */
  useEffect(() => {
    const unsub = window.overlayControl.onEnterCtrl(() => {
      clearTimeout(timerRef.current);
      setCtrlMode(p => {
        const next = !p;
        if (next) {
          // kontrol modu açılırken:
          armCtrlTimeout();
          // Mouse tracking hook artık mouse eventlerini yönetiyor
        } else {
          // kontrol modu kapanırken varsayılan tüm ekrana dön
          window.overlayControl.exitCtrl?.();
        }
        return next;
      });
    });
    return () => unsub();
  }, [armCtrlTimeout, rootRef]);

  return { ctrlMode, armCtrlTimeout };
}
