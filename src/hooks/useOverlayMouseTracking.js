/******************************************************************************************
 * src/hooks/useOverlayMouseTracking.js
 *
 * Overlay kontrol ve sürükleme modlarında mouse eventlerini ana işleme (main-process)
 * yönlendirmek / engellemek için hook. Amaç, kontrol & drag modundayken sadece overlay
 * elementleri üzerinde tıklanabilsin; overlay dışındaki alanlar ise alttaki pencere /
 * masaüstüne tıklamaya devam edebilsin.
 *
 * Parametreler:
 *  - isControlMode : boolean       // useOverlayControl’dan gelen ctrlMode
 *  - isDragMode    : boolean       // useOverlayDrag’den gelen dragMode
 *  - overlayRef    : React.Ref     // Overlay root DOM element’i
 *
 * Özellikler:
 *  - isControlMode || isDragMode true olduğunda tracking başlar; kapandığında durur.
 *  - mousemove olaylarında document.elementFromPoint ile imlecin overlay üzerinde
 *    olup olmadığı tespit edilir.
 *  - Duruma göre window.overlayControl.setMouseIgnore(shouldIgnore) çağırılarak
 *    Electron’un setIgnoreMouseEvents API’si sarılı olarak ana işlem bilgilendirilir.
 *  - performans için 10 ms throttling uygulanır.
 *  - Hook, cleanup sırasında tüm dinleyicileri ve zamanlayıcıları temizler.
 *
 * Döndürdüğü değerler:
 *  - Yok — Hook, side‑effect olarak overlay’in mouse davranışını yönetir.
 *
 * Kullanımı:
 *    const overlayRef = useRef(null);
 *    useOverlayMouseTracking(ctrlMode, dragMode, overlayRef);
 *
 * Based on:
 * https://github.com/electron/electron/issues/38396
 ******************************************************************************************/

import { useRef, useEffect, useCallback } from 'react';

export default function useOverlayMouseTracking(isControlMode, isDragMode, overlayRef) {
  const isTrackingRef = useRef(false);
  const lastIgnoreStateRef = useRef(null);
  const throttleTimeoutRef = useRef(null);

  // Mouse tracking aktif mi kontrolü
  const isTrackingActive = isControlMode || isDragMode;

  // Mouse pozisyonunu kontrol eden fonksiyon (throttled)
  const checkMousePosition = useCallback((e) => {
    if (!overlayRef.current || !isTrackingActive) return;

    // Performance için throttling (10ms)
    if (throttleTimeoutRef.current) return;
    throttleTimeoutRef.current = setTimeout(() => {
      throttleTimeoutRef.current = null;
    }, 10);

    try {
      const overlayElement = overlayRef.current;
      
      // Element altında mouse var mı kontrol et (child elementler dahil)
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
      const isOverOverlay = elementUnderMouse && overlayElement.contains(elementUnderMouse);

      // Sadece durum değiştiğinde IPC gönder (performance için)
      const shouldIgnore = !isOverOverlay;
      if (lastIgnoreStateRef.current !== shouldIgnore) {
        lastIgnoreStateRef.current = shouldIgnore;
        
        // Safety check
        if (window.overlayControl?.setMouseIgnore) {
          window.overlayControl.setMouseIgnore(shouldIgnore);
        }
      }
    } catch (error) {
      console.warn('Mouse tracking error:', error);
      // Hata durumunda güvenli tarafta kalıp mouse eventlerini geçir
      if (window.overlayControl?.setMouseIgnore) {
        window.overlayControl.setMouseIgnore(true);
      }
    }
  }, [isTrackingActive, overlayRef]);

  // Mouse tracking başlat/durdur
  useEffect(() => {
    if (!isTrackingActive) {
      // Tracking kapalıysa durur ve mouse eventlerini geçir
      if (isTrackingRef.current) {
        window.removeEventListener('mousemove', checkMousePosition);
        isTrackingRef.current = false;
        lastIgnoreStateRef.current = null;
        window.overlayControl?.setMouseIgnore(true);
      }
      return;
    }

    // Tracking açıksa başlat
    if (!isTrackingRef.current) {
      // Başlangıçta mouse eventlerini geçir (overlay dışında olabiliriz)
      lastIgnoreStateRef.current = true;
      window.overlayControl?.setMouseIgnore(true);
      window.addEventListener('mousemove', checkMousePosition);
      isTrackingRef.current = true;
    }

    // Cleanup function
    return () => {
      if (isTrackingRef.current) {
        window.removeEventListener('mousemove', checkMousePosition);
        isTrackingRef.current = false;
        lastIgnoreStateRef.current = null;
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
          throttleTimeoutRef.current = null;
        }
        window.overlayControl?.setMouseIgnore(true);
      }
    };
  }, [isTrackingActive, checkMousePosition]);

  // Component unmount'ta cleanup
  useEffect(() => {
    return () => {
      if (isTrackingRef.current) {
        window.removeEventListener('mousemove', checkMousePosition);
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
        }
        window.overlayControl?.setMouseIgnore(true);
      }
    };
  }, [checkMousePosition]);
}
