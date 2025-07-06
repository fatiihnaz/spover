// src/renderer/SimpleOverlayUI/OverlayCurrent.jsx
import React from 'react';

export default function OverlayCurrent({ now, genre, pct, paused, VIS }) {
  const FONT_SMALL = Math.max(VIS, 0.7);
  const cover = now?.item?.album?.images?.[1] ?? now?.item?.album?.images?.[0];

  return (
    <div className="flex items-start gap-4 w-full overflow-hidden">
      {/* ─── Soldaki Albüm Kapağı ─── */}
      {cover && (
        <img
          src={cover.url}
          style={{ width: 60 * VIS, height: 60 * VIS }}
          className={`
            rounded-md object-cover flex-shrink-0
            ${paused ? 'grayscale-[65%]' : ''}
          `}
          alt=""
        />
      )}

      {/* ─── Sağdaki Metin + Progress Bar ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Şarkı Başlığı */}
        <span
          style={{ fontSize: `${14 * FONT_SMALL}px` }}
          className="font-semibold text-white truncate"
        >
          {now?.item?.name ?? '—'}
        </span>

        {/* Sanatçı + Genre */}
        <span
          style={{ fontSize: `${11 * FONT_SMALL}px` }}
          className="text-zinc-300 truncate mt-0.5"
        >
          {now?.item?.artists?.map(a => a.name).join(', ') ?? ''}
          {genre ? ` | ${genre}` : ''}
        </span>

        {/* Progress Bar (yalnızca bu dikey blok kadar geniş) */}
        <div className="mt-2 w-full h-[4px] rounded-full bg-white/10 overflow-hidden">
          <div
            className={`
              h-full rounded-full transition-[width] duration-300
              ${paused ? 'bg-zinc-500' : 'bg-gradient-to-r from-[#1db954] to-[#1ed760]'}
            `}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
