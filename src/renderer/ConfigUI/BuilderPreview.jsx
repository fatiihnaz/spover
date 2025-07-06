// BuilderPreview.jsx – 3‑lü bölmeli overlay mock-up
import React from 'react';

/**
 *  cfg.bgColor, cfg.opacity, cfg.orientation (horizontal / vertical)
 *  gösterimine göre 3 bölmeli placeholder çizer.
 */
export default function BuilderPreview({ cfg }) {
  const box = {
    position: 'absolute', pointerEvents: 'none', borderRadius: 8,
    backgroundColor: cfg.bgColor, opacity: cfg.opacity,
    width: `${20 * cfg.scale}%`, height: `${10 * cfg.scale}%`
  };
  if (cfg.position.includes('top')) box.top = '4%'; else box.bottom = '4%';
  if (cfg.position.endsWith('left')) box.left = '4%';
  else if (cfg.position.endsWith('center')) { box.left = '50%'; box.transform = 'translateX(-50%)'; }
  else box.right = '4%';

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-4/5 aspect-video border-2 border-dashed rounded-md relative">
        {/* Main overlay container */}
        <div className="grid"
             /* üç bölme: orientation göre grid-template */
             style={{...box,
               display:'grid',
               gridTemplateColumns: cfg.orientation==='vertical' ? '1fr' : 'repeat(3,1fr)',
               gridTemplateRows:    cfg.orientation==='vertical' ? 'repeat(3,1fr)' : '1fr'
             }}>
          {[0,1,2].map(i=>(
            <div key={i} className="border border-white/10 flex items-center justify-center text-xs text-white/60">
              Bölme {i+1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
