// src/renderer/SimpleOverlayUI/OverlayPlaylist.jsx
import React from 'react';

export default function OverlayPlaylist({ playlistName, playlistOwner, playlistCover, VIS }) {
  const FONT_SMALL = Math.max(VIS, 0.7);

  return (
    <div className="flex items-center gap-4 overflow-hidden">
      {playlistCover && (
        <img
          src={playlistCover.url}
          style={{ width: 60 * VIS, height: 60 * VIS }}
          className="rounded-md object-cover flex-shrink-0"
          alt=""
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <span
          style={{ fontSize: `${10 * FONT_SMALL}px` }}
          className="tracking-widest uppercase text-zinc-400"
        >
          CURRENT PLAYLIST
        </span>
        <span
          style={{ fontSize: `${14 * FONT_SMALL}px` }}
          className="font-semibold text-white truncate"
        >
          {playlistName ?? '—'}
        </span>
        <span
          style={{ fontSize: `${11 * FONT_SMALL}px` }}
          className="text-zinc-300 truncate"
        >
          by {playlistOwner ?? '—'}
        </span>
      </div>
    </div>
  );
}
