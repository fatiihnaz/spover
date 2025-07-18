// src/renderer/SimpleOverlayUI/OverlayCurrent.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OverlayCurrent({ now, genre, pct, paused, VIS }) {
  const FONT_SMALL = Math.max(VIS, 0.7);
  const cover = now?.item?.album?.images?.[1] ?? now?.item?.album?.images?.[0];
  
  // Cycle state: true = sanatçı, false = genre
  const [showArtist, setShowArtist] = useState(true);
  
  const artistText = now?.item?.artists?.map(a => a.name).join(', ') ?? '';
  const genreText = genre 
    ? genre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
    : 'Genre Not Known';
  
  // 8 saniyede bir cycle yap (her zaman cycle yap çünkü fallback text var)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowArtist(prev => !prev);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

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

        {/* Sanatçı + Genre (Animated Cycle) */}
        <div 
          style={{ height: `${16 * FONT_SMALL}px` }}
          className="relative overflow-hidden mt-0.5"
        >
          <AnimatePresence initial={false}>
            <motion.span
              key={showArtist ? 'artist' : 'genre'}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              style={{ fontSize: `${11 * FONT_SMALL}px` }}
              className="absolute inset-0 text-zinc-300 truncate flex items-center"
            >
              {showArtist ? artistText : genreText}
            </motion.span>
          </AnimatePresence>
        </div>

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
