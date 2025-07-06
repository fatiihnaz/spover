import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useConfig from '../hooks/useConfig';

// UI parçaları
import OverlayCurrent from './SimpleOverlayUI/OverlayCurrent';
import OverlayBPM from './SimpleOverlayUI/OverlayBPM';
import OverlayNext from './SimpleOverlayUI/OverlayNext';
import OverlayPlaylist from './SimpleOverlayUI/OverlayPlaylist';
import OverlayController from './SimpleOverlayUI/OverlayController';

const DRAG_HIDE_DELAY = 10_000; // ms

/*  useDrag – sürükle-bırak mantığı                            */
/* ---------------------------------------------------------- */
function useDrag(cfg, setCfg) {
  const [pos, setPos] = useState(cfg.pos);
  const [dragMode, setDragMode] = useState(false);
  const rootRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => setPos(cfg.pos), [cfg.pos]);

  // OverlayControl üzerinden drag moduna gir
  useEffect(() => {
    const unsub = window.overlayControl.onEnterDrag(() => {
      clearTimeout(timerRef.current);
      setDragMode(true);
    });
    return () => unsub?.();
  }, []);

  // 10 sn hareketsizlikte drag modundan çık
  const armTimeout = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDragMode(false), DRAG_HIDE_DELAY);
  }, []);

  // Pointer olayları
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

      setCfg(prev => ({ ...prev, pos: finalPos }));

      window.overlayControl.exitDrag?.();
      setDragMode(false);
    }

    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [dragMode, pos, cfg, setCfg, armTimeout]);

  return { rootRef, pos, dragMode };
}

/* ---------------------------------------------------------- */
/*  Overlay bileşeni                                          */
/* ---------------------------------------------------------- */
export default function Overlay() {
  /* ---------------- Settings ---------------- */
  const [cfg, setCfg] = useConfig();

  // Drag kancası
  const { rootRef, pos, dragMode } = useDrag(cfg, setCfg);

  /* ------------- Diğer state ve efektler ------------- */
  const [now, setNow] = useState(null);
  const [volume, setVolume] = useState(null);
  const [features, setFeatures] = useState(null);
  const [currentGenre, setCurrentGenre] = useState(null);
  const [queue, setQueue] = useState([]);
  const [playlistDetails, setPlaylistDetails] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [ctrlMode, setCtrlMode] = useState(false);
  const timerRef = useRef(null);

  // Dinamik renk (Vibrant) – default Spotify yeşili
  const [dominantColor, setDominantColor] = useState('#1db954');

  /* Spotify ve Settings abonelikleri */
  useEffect(() => {
    const unsub = window.spotify.onNow(data => {
      setNow(data);
      if (data?.volume_percent !== undefined) {
        setVolume(data.volume_percent);
      }
    });
    return () => unsub();
  }, []);

  // AudioFeatures
  useEffect(() => {
    if (!now?.item?.id) return setFeatures(null);
    window.spotify.getAudioFeatures(now.item.id)
      .then(setFeatures)
      .catch(() => setFeatures(null));
  }, [now?.item?.id]);

  // Artist Genre
  useEffect(() => {
    const aid = now?.item?.artists?.[0]?.id;
    if (!aid) return setCurrentGenre(null);
    window.spotify.getArtist(aid)
      .then(a => setCurrentGenre(a.genres?.[0] || null))
      .catch(() => setCurrentGenre(null));
  }, [now?.item?.artists]);

  // Queue (Next Song)
  useEffect(() => {
    if (!now) return setQueue([]);
    window.spotify.getQueue()
      .then(r => setQueue(r.queue || []))
      .catch(() => setQueue([]));
  }, [now]);

  // Playlist Details
  useEffect(() => {
    if (now?.context?.type === 'playlist') {
      const pid = now.context.uri.split(':').pop();
      window.spotify.getPlaylist(pid)
        .then(setPlaylistDetails)
        .catch(() => setPlaylistDetails(null));
    } else {
      setPlaylistDetails(null);
    }
  }, [now?.context?.uri]);

  /* -------------------------------------------------- */
  /*  Vibrant: albüm kapağından baskın renk çek          */
  /* -------------------------------------------------- */
  const cover = now?.item?.album?.images?.[1] ?? now?.item?.album?.images?.[0];
  useEffect(() => {
    if (!cover?.url) return;
    let cancelled = false;

    import('node-vibrant')
      .then(({ default: Vibrant }) => Vibrant.from(cover.url).getPalette())
      .then(pal => {
        if (cancelled) return;
        const vib = pal?.Vibrant?.hex || pal?.Muted?.hex;
        if (vib) setDominantColor(vib);
      })
      .catch(() => {/* ignore */ });

    return () => { cancelled = true; };
  }, [cover?.url]);

  /* ------------ Drag & Ctrl modlarındaki otomatik kapanma --------- */
  const armCtrlTimeout = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCtrlMode(false);
      window.overlayControl.exitCtrl?.();
    }, DRAG_HIDE_DELAY);
  }, []);

  // Ctrl-mode giriş
  useEffect(() => {
    const unsub = window.overlayControl.onEnterCtrl(() => {
      clearTimeout(timerRef.current);
      setCtrlMode(p => {
        const next = !p;
        if (next) {
          // kontrol modu açılırken:
          armCtrlTimeout();
          if (rootRef.current) {
            const { left, top, width, height } = rootRef.current.getBoundingClientRect();
            window.overlayControl.setControlRegion({
              x: Math.round(left),
              y: Math.round(top),
              width: Math.round(width),
              height: Math.round(height),
            });
          }
        } else {
          // kontrol modu kapanırken varsayılan tüm ekrana dön
          window.overlayControl.exitCtrl?.();
        }
        return next;
      });
    });
    return () => unsub();
  }, []);

  /* ----------------  Görsel yardımcı değişkenler ------------------ */
  const VIS = Math.min(cfg.scale, 1.6);
  const pct = now?.item ? (now.progress_ms / now.item.duration_ms) * 100 : 0;
  const paused = now && !now.is_playing;
  const bpm = features?.tempo ? Math.round(features.tempo) : null;

  const next = queue[0];
  const nextProps = next
    ? {
      nextTrack: next.name,
      nextArtists: next.artists.map(a => a.name).join(', '),
      nextGenre: next.artists[0]?.genres?.[0] || null,
      coverNext: next.album.images[1] ?? next.album.images[0],
    }
    : {};

  const plProps = playlistDetails
    ? {
      playlistName: playlistDetails.name,
      playlistOwner: playlistDetails.owner.display_name,
      playlistCover: playlistDetails.images[0],
    }
    : {};

  /* -------------------- Aktif mod listesi ------------------------- */
  const allModes = [
    { id: 'showCurrent', Comp: OverlayCurrent, props: { now, bpm, genre: currentGenre, pct, paused, VIS, cover } },
    { id: 'showBPM', Comp: OverlayBPM, props: { bpm, VIS } },
    { id: 'showNext', Comp: OverlayNext, props: { ...nextProps, VIS } },
    { id: 'showPlaylist', Comp: OverlayPlaylist, props: { VIS, ...plProps } },
  ];
  const enabledModes = allModes.filter(m => cfg[m.id]);

  /* Aktif index'in kapsayıcı ref'i – Ctrl+O ile geçiş */
  const enabledRef = useRef(enabledModes);
  useEffect(() => {
    enabledRef.current = enabledModes;
    setActiveIdx(i => (enabledModes.length ? Math.min(i, enabledModes.length - 1) : 0));
  }, [enabledModes]);

  useEffect(() => {
    const handler = () => {
      setActiveIdx(i => {
        const modes = enabledRef.current;
        return modes.length > 1 ? (i + 1) % modes.length : 0;
      });
    };
    const unsub = window.overlayControl.onCycleMode(handler);
    return () => unsub();
  }, []);

  /* -------------------- Pozisyon stili ---------------------------- */
  const baseStyle = useCallback(
    () => ({ top: pos.y, left: pos.x }),   // artık translate yok
    [pos],
  );

  /* ------------------------- Render ------------------------------- */
  const ActiveComp = enabledModes[activeIdx]?.Comp;
  const activeProps = enabledModes[activeIdx]?.props || {};

  return (
    <div
      ref={rootRef}
      style={{
        width: Math.max(200, Math.min(260 * VIS, 600)),
        opacity: cfg.opacity,
        pointerEvents: dragMode || ctrlMode ? 'auto' : 'none',
        // Konum
        ...baseStyle(),
        // Arkaplan
        background:
          cfg.bgMode === 'static'
            ? cfg.bgColor
            : `linear-gradient(135deg, ${cfg.bgColor} 0%, rgba(0,0,0,0.85) 100%)`,
      }}
      className="
        fixed px-3 py-2
        bg-[linear-gradient(135deg,#111,#1a1a1ae8)]
        border border-white/10 rounded-xl
        backdrop-blur-sm shadow-[0_8px_28px_rgba(0,0,0,0.55)]
        select-none overflow-hidden"
      onPointerDown={() => ctrlMode && armCtrlTimeout()}
      onPointerMove={() => ctrlMode && armCtrlTimeout()}
    >
      {/* ----------- Aktif içerik ------------ */}
      {now?.item ? (
        <AnimatePresence mode="wait" initial={false}>
          {ActiveComp && (
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-4 w-full overflow-hidden"
            >
              <ActiveComp {...activeProps} />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <p className="text-xs text-zinc-500 text-center">NO DATA</p>
      )}

      {/* ----------- Spotify kontrol paneli (ctrlMode ON) ------------ */}
      <AnimatePresence mode="wait" initial={false}>
        {ctrlMode && (
          <OverlayController
            VIS={VIS}
            volume={volume ?? 0}
            isPlaying={!paused}
            onAction={(action, payload) => {
              armCtrlTimeout();
              const s = window.spotify;
              switch (action) {
                case 'prev':
                  s?.prev?.();
                  break;
                case 'play':
                  s?.togglePlay?.();
                  break;
                case 'next':
                  s?.next?.();
                  break;
                case 'vol':
                  setVolume(payload);
                  s?.setVolume?.(payload)
                  break;
                default:
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
