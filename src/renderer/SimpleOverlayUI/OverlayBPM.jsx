// src/renderer/SimpleOverlayUI/OverlayBPM.jsx
import React from 'react';

export default function OverlayBPM({ bpm, VIS }) {
  const FONT_SMALL = Math.max(VIS, 0.7);

  return (
    <div className="flex items-center gap-4 overflow-hidden">
      <div className="flex-1 flex flex-col items-center overflow-hidden min-w-0">
        <span
          style={{ fontSize: `${10 * FONT_SMALL}px` }}
          className="tracking-widest uppercase text-zinc-400"
        >
          BPM
        </span>
        <span
          style={{ fontSize: `${26 * VIS}px` }}
          className="font-semibold text-white truncate"
        >
          {bpm ?? '--'}
        </span>
      </div>
    </div>
  );
}
