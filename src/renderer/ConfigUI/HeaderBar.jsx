// src/renderer/HeaderBar.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Minus, Maximize, X as Close } from 'lucide-react';

export default function HeaderBar({ spotifyReady }) {
  const ctrl = fn => window.windowCtrl?.[fn]?.();

  // Track whether we've received any Spotify status yet
  const [initial, setInitial] = useState(true);
  useEffect(() => {
    // Once spotifyReady becomes true or false (not null/undefined), data has arrived
    if (spotifyReady !== null && spotifyReady !== undefined) {
      setInitial(false);
    }
  }, [spotifyReady]);

  // Determine current status: loading, ready, or error
  let status;
  if (initial) {
    status = 'loading';
  } else {
    status = spotifyReady ? 'ready' : 'error';
  }

  // Map status to dot and text
  const colors = {
    loading: {
      ring: 'bg-yellow-400/30 animate-ping',
      dot: 'bg-yellow-400'
    },
    ready: {
      ring: 'bg-green-400/30 animate-ping',
      dot: 'bg-green-400'
    },
    error: {
      ring: 'bg-red-500/30 animate-ping',
      dot: 'bg-red-500'
    }
  };

  const statusText = {
    loading: 'Spotify Bilgisi Bekleniyor',
    ready: 'Spotify Bağlı',
    error: 'Spotify Bağlı Değil'
  }[status];

  const { ring, dot } = colors[status];

  const StatusDot = () => (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full rounded-full ${ring}`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
    </span>
  );

  return (
    <header className="flex items-center justify-between bg-zinc-900/85 border-b border-zinc-700 px-3 py-1.5 select-none window-drag">
      {/* Sol taraf: Ayarlar + Spotify durumu */}
      <div className="flex items-center gap-2 window-no-drag">
        <StatusDot />
        <span className="text-xs font-medium whitespace-nowrap">
          {statusText}
        </span>
        {/* Show connect button only if data arrived and not ready */}
        {!initial && !spotifyReady && (
          <button
            onClick={() => window.spotify?.login?.()}
            className="ml-1 text-xs px-1.5 py-0.5 bg-green-600 rounded hover:bg-green-600/80"
          >
            Bağlan
          </button>
        )}
      </div>

      {/* Pencere kontrolleri */}
      <div className="flex items-center gap-1 window-no-drag">
        <button
          onClick={() => window.openSettings?.()}
          className="p-1 rounded-sm hover:bg-white/10 transition"
          title="Ayarlar"
        >
          <Settings size={14} strokeWidth={1.25} className="text-zinc-300" />
        </button>
        <button
          onClick={() => ctrl('minimize')}
          className="p-1 rounded-sm hover:bg-white/10 transition"
          title="Küçült"
        >
          <Minus size={14} strokeWidth={1.25} className="text-zinc-300" />
        </button>
        <button
          onClick={() => ctrl('maximize')}
          className="p-1 rounded-sm hover:bg-white/10 transition"
          title="Büyüt/Geri Al"
        >
          <Maximize size={12} strokeWidth={1.25} className="text-zinc-300" />
        </button>
        <button
          onClick={() => ctrl('hideMain')}
          className="p-1 rounded-sm hover:bg-red-500/90 hover:text-white transition"
          title="Kapat"
        >
          <Close size={14} strokeWidth={1.25} className="text-zinc-300" />
        </button>
      </div>
    </header>
  );
}
