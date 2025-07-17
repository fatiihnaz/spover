// components/overlay/Overlay.jsx
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useConfig from '../hooks/useConfig';
import useDragOverlay from '../hooks/useOverlayDrag';
import useSpotifyOverlayData from '../hooks/useOverlaySpotifyData';
import useVibrantColor from '../hooks/useOverlayReactiveColor';
import useOverlayModes from '../hooks/useOverlayModes';
import useOverlayControl from '../hooks/useOverlayControl';

import OverlayCurrent from './SimpleOverlayUI/OverlayCurrent';
import OverlayBPM from './SimpleOverlayUI/OverlayBPM';
import OverlayNext from './SimpleOverlayUI/OverlayNext';
import OverlayPlaylist from './SimpleOverlayUI/OverlayPlaylist';
import OverlayController from './SimpleOverlayUI/OverlayController';

const DRAG_HIDE_DELAY = 10_000; // ms

export default function Overlay() {
  /* settings + drag */
  const [cfg, setCfg] = useConfig();
  const { rootRef, pos, dragMode } = useDragOverlay(cfg.pos, p => setCfg({ ...cfg, pos: p }));

  /* spotify verisi */
  const {
    now, volume, setVolume, features, genre,
    queue, playlist,
  } = useSpotifyOverlayData();

  /* renk */
  const cover = now?.item?.album?.images?.[1] ?? now?.item?.album?.images?.[0];
  const dominantColor = useVibrantColor(cover?.url);

  /* control mode */
  const { ctrlMode, armCtrlTimeout } = useOverlayControl(rootRef);

  /* modlar */
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

  const plProps = playlist
    ? {
        playlistName: playlist.name,
        playlistOwner: playlist.owner.display_name,
        playlistCover: playlist.images[0],
      }
    : {};

  const modes = [
    { id: 'showCurrent', enabled: cfg.showCurrent, Comp: OverlayCurrent, props: { now, bpm, genre, pct, paused, VIS, cover } },
    { id: 'showBPM', enabled: cfg.showBPM, Comp: OverlayBPM, props: { bpm, VIS } },
    { id: 'showNext', enabled: cfg.showNext, Comp: OverlayNext, props: { ...nextProps, VIS } },
    { id: 'showPlaylist', enabled: cfg.showPlaylist, Comp: OverlayPlaylist, props: { VIS, ...plProps } },
  ];
  const { Active, props } = useOverlayModes(modes);

  /* render */
  return (
    <div
      ref={rootRef}
      className="fixed px-3 py-2 border border-white/10 rounded-xl
                 backdrop-blur-sm shadow-[0_8px_28px_rgba(0,0,0,0.55)]
                 select-none overflow-hidden"
      style={{
        top: pos.y, 
        left: pos.x,
        width: Math.max(200, Math.min(260 * VIS, 600)),
        opacity: cfg.opacity,
        pointerEvents: dragMode || ctrlMode ? 'auto' : 'none',
        background: cfg.bgMode === 'static'
          ? cfg.bgColor
          : `linear-gradient(135deg, ${cfg.bgColor} 0%, rgba(0,0,0,0.85) 100%)`,
      }}
      onPointerDown={() => ctrlMode && armCtrlTimeout()}
      onPointerMove={() => ctrlMode && armCtrlTimeout()}
    >
      {/* ----------- Aktif içerik ------------ */}
      {now?.item ? (
        <AnimatePresence mode="wait" initial={false}>
          {Active && (
            <motion.div
              key={modes.findIndex(m => m.Comp === Active)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-4 w-full overflow-hidden"
            >
              <Active {...props} />
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
                  s?.setVolume?.(payload);
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
