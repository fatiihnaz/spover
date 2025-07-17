/******************************************************************************************
 * src/hooks/useOverlayDrag.js
 *
 * Overlay’i ekranda sürükleyerek yeni konumlandırmak için hook.
 *
 * Parametreler:
 *  - cfgPos:    { x, y }        // Başlangıç konumu (settings’ten)
 *  - updatePos: (pos) → void    // Yeni konumu parent/settings’e iletir
 *
 * Özellikler:
 *  - window.overlayControl.onEnterDrag() tetiklenince dragMode true olur.
 *  - rootRef’te pointerdown/move/up ile sürükleme yapılır; pos state’i anlık güncellenir.
 *  - Bırakıldığında updatePos() çağrılır ve dragMode kapanır.
 *  - DRAG_HIDE_DELAY (10 sn) hareketsizlikte dragMode otomatik kapanır.
 *  - Konum, pencere sınırları dışına taşmayacak şekilde sınırlandırılır.
 *
 * Döndürdüğü değerler:
 *  - rootRef:  React ref      // Pointer dinleyicileri için overlay root
 *  - pos:      { x, y }       // Güncel konum
 *  - dragMode: boolean        // Drag modunun açık/kapalı durumu
 *
 * Kullanımı:
 *  const { rootRef, pos, dragMode } =
 *        useOverlayDrag(cfg.pos, p => setCfg(c => ({ ...c, pos: p })));
 ******************************************************************************************/

import { useState, useRef, useEffect, useCallback } from 'react';

const DRAG_HIDE_DELAY = 10_000;

export default function useDragOverlay(cfgPos, updatePos) {
  const [pos, setPos] = useState(cfgPos);
  const [dragMode, setDragMode] = useState(false);
  const rootRef   = useRef(null);
  const timerRef  = useRef(null);

  /* cfg değişince güncelle */
  useEffect(() => setPos(cfgPos), [cfgPos]);

  /* OverlayControl → drag aç/kapat */
  useEffect(() => {
    const unsub = window.overlayControl.onEnterDrag(() => {
      clearTimeout(timerRef.current);
      setDragMode(true);
    });
    return () => unsub?.();
  }, []);

  /* 10 sn hareketsizlikte otomatik çık */
  const armTimeout = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDragMode(false), DRAG_HIDE_DELAY);
  }, []);

  /* pointer olayları */
  useEffect(() => {
    if (!dragMode) return;
    const el = rootRef.current;
    if (!el) return;

    let start = { x: 0, y: 0 };
    let origin = { x: 0, y: 0 };

    function onDown(e) {
      start = { x: e.clientX, y: e.clientY };
      const rect = el.getBoundingClientRect();
      origin = { x: rect.left, y: rect.top };
      armTimeout();
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }

    function onMove(e) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const { innerWidth: W, innerHeight: H } = window;
      const rect = el.getBoundingClientRect();
      const newX = Math.min(Math.max(0, origin.x + dx), W - rect.width);
      const newY = Math.min(Math.max(0, origin.y + dy), H - rect.height);

      setPos({ x: newX, y: newY });
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      const rect = el.getBoundingClientRect();
      const { innerWidth: W, innerHeight: H } = window;
      const finalPos = {
        x: Math.min(Math.max(0, rect.left), W - rect.width),
        y: Math.min(Math.max(0, rect.top), H - rect.height),
      };

      setPos(finalPos);                      // local state
      updatePos(finalPos);                   // parent'a bildir

      setDragMode(false);
    }

    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [dragMode, pos, armTimeout, updatePos]);

  return { rootRef, pos, dragMode };
}
