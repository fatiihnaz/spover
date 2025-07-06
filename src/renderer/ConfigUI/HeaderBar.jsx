// src/renderer/HeaderBar.jsx
import React from 'react';
import { Settings, Minus, Maximize, X as Close } from 'lucide-react';

export default function HeaderBar({ spotifyReady }) {
  const ctrl = fn => window.windowCtrl?.[fn]?.();

  /* ---------------- Spotify status indicator ---------------- */
  const StatusDot = ({ ready }) => (
    <span className="relative flex h-2.5 w-2.5">
      {/* outer pulsing ring */}
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${
          ready
            ? 'bg-green-400/30 animate-ping'
            : 'bg-red-500/30 animate-ping'
        }`}
      />
      {/* solid dot */}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          ready ? 'bg-green-400' : 'bg-red-500'
        }`}
      />
    </span>
  );

  return (
    <header className="flex items-center justify-between bg-zinc-900/85 border-b border-zinc-700 px-3 py-1.5 select-none">
      {/* Sol taraf: Ayarlar + Spotify durum */}
      <div className="flex items-center gap-2">
        {/* Spotify bağlantı durumu */}
        <div className="flex items-center gap-2">
          <StatusDot ready={spotifyReady} />
          <span className="text-xs font-medium whitespace-nowrap">
            {spotifyReady ? 'Spotify Bağlı' : 'Spotify Bağlı Değil'}
          </span>
          {!spotifyReady && (
            <button
              onClick={() => window.spotify?.login?.()}
              className="ml-1 text-xs px-1.5 py-0.5 bg-green-600 rounded hover:bg-green-600/80"
            >
              Bağlan
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Settings (future use) */}
        <button
          onClick={() => window.openSettings?.()}
          className="p-1 rounded-sm hover:bg-white/10 transition"
          title="Ayarlar"
        >
          <Settings size={14} strokeWidth={1.25} className="text-zinc-300" />
        </button>

        {/* Minimize */}
        <button
          onClick={() => ctrl('minimize')}
          className="p-1 rounded-sm hover:bg-white/10 transition"
          title="Küçült"
        >
          <Minus size={14} strokeWidth={1.25} className="text-zinc-300" />
        </button>

        {/* Maximize/Restore */}
        <button
          onClick={() => ctrl('maximize')}
          className="p-1 rounded-sm hover:bg-white/10 transition"
          title="Büyüt/Geri Al"
        >
          <Maximize size={12} strokeWidth={1.25} className="text-zinc-300" />
        </button>

        {/* Close */}
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
