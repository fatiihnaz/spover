// src/renderer/ControlUI/OverlaySettings.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Squircle, SquareChartGantt, Square } from 'lucide-react';

export default function OverlaySettings({ cfg, setCfg }) {
  // Pozisyon seçenekleri: önce üst, sonra alt satır
  const posOpts = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];
  const posLabel = id => ({
    'top-left': <ArrowUpLeft />,
    'top-center': <ArrowUp />,
    'top-right': <ArrowUpRight />,
    'center-left': <ArrowLeft />,
    'center': <Squircle />,
    'center-right': <ArrowRight />,
    'bottom-left': <ArrowDownLeft />,
    'bottom-center': <ArrowDown />,
    'bottom-right': <ArrowDownRight />,
  })[id];

  const marginPct = 0.014;                    // 1.4 %
  const { width: SW, height: SH } = window.screen;

  const VIS = Math.min(cfg.scale, 1.6);     // Overlay.jsx’teki formül
  const boxW = Math.max(200, Math.min(260 * VIS, 600));
  const boxH = boxW / 2;                     // 2:1 oran (gen x yük)

  const anchors = {
    'top-left': { x: marginPct * SW, y: marginPct * SH, },
    'top-center': { x: SW / 2 - boxW / 2, y: marginPct * SH, },
    'top-right': { x: SW - marginPct * SW - boxW, y: marginPct * SH, },
    'center-left': { x: marginPct * SW, y: SH / 2 - boxH / 2 },
    'center': { x: SW / 2 - boxW / 2, y: SH / 2 - boxH / 2 },
    'center-right': { x: SW - marginPct * SW - boxW, y: SH / 2 - boxH / 2 },
    'bottom-left': { x: marginPct * SW, y: SH - marginPct * SH - boxH, },
    'bottom-center': { x: SW / 2 - boxW / 2, y: SH - marginPct * SH - boxH, },
    'bottom-right': { x: SW - marginPct * SW - boxW, y: SH - marginPct * SH - boxH, },
  };

  const isActive = id => {
    if (!cfg?.pos) return false;          // <-- NULL guard
    const a = anchors[id];
    return Math.abs(cfg.pos.x - a.x) < 1 &&
      Math.abs(cfg.pos.y - a.y) < 1;
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Overlay</h2>
      <div className="rounded-lg overflow-hidden divide-y divide-zinc-700">
        {/* Pozisyon */}
        <div className="p-4">
          <span className="block mb-2 text-white font-medium">Pozisyon</span>
          <div className="grid grid-cols-3 gap-3 w-fit">
            {posOpts.map(id => (
              <button
                key={id}
                onClick={() => setCfg({ ...cfg, pos: anchors[id] })}
                className={`
                  w-12 h-12 py-2 text-sm  font-medium rounded-md transition-colors flex justify-center items-center
                  ${isActive(id) ? 'bg-green-600 text-white' : 'bg-zinc-700/50 hover:bg-zinc-600 text-white/60'}`}
              >
                {posLabel(id)}
              </button>
            ))}
          </div>
        </div>

        {/* Saydamlık */}
        <div className="p-4">
          <span className="block mb-2 text-white font-medium">
            Saydamlık: <span className="font-semibold">{Math.round(cfg.opacity * 100)}%</span>
          </span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            className="w-full accent-green-600"
            value={cfg.opacity}
            onChange={e =>
              setCfg({ ...cfg, opacity: parseFloat(e.target.value) })
            }
          />
        </div>

        {/* Boyut */}
        <div className="p-4">
          <span className="block mb-2 text-white font-medium">
            Boyut: <span className="font-semibold">{Math.round(cfg.scale * 100)}%</span>
          </span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            className="w-full accent-green-600"
            value={cfg.scale}
            onChange={e =>
              setCfg({ ...cfg, scale: parseFloat(e.target.value) })
            }
          />
        </div>

        {/* Renk Modu */}
        <div className="p-4">
          <span className="block mb-3 text-white font-medium">Renk Modu</span>

          {/* 4 noktalı slider */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 relative">
              {/* Slider çizgisi */}
              <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-zinc-600 rounded"></div>

              {/* Noktalar */}
              <div className="flex justify-between relative z-10">
                {['static', 'light-muted', 'muted', 'dark-muted'].map((mode, index) => (
                  <button
                    key={mode}
                    onClick={() => setCfg({ ...cfg, colorMode: mode })}
                    className={`
                      w-4 h-4 rounded-full border-2 transition-all duration-200
                      ${cfg.colorMode === mode
                        ? 'bg-green-500 border-green-500 scale-125'
                        : 'bg-zinc-700 border-zinc-500 hover:border-zinc-400'}
                    `}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mod etiketleri */}
          <div className="flex justify-between text-xs text-zinc-400 mb-3">
            <span>Statik</span>
            <span>Açık</span>
            <span>Orta</span>
            <span>Koyu</span>
          </div>

          {/* Statik modda renk seçici */}
          <AnimatePresence mode="wait">
            {cfg.colorMode === 'static' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.25, 0.1, 0.25, 1.0],
                  height: { duration: 0.25 },
                  opacity: { duration: 0.2, delay: cfg.colorMode === 'static' ? 0.1 : 0 }
                }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-zinc-700/30 rounded-lg border border-zinc-600/50">
                  {/* Statik tip seçimi - Düz/Gradyan */}
                  <div className="flex items-center justify-between mb-3">
                    <div className='space-x-2'>
                      <span className="text-sm text-zinc-300 font-medium">Arka Plan Rengi</span>
                      <span className="text-xs text-zinc-400 font-mono select-none tracking-wider">
                        {cfg.bgColor.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex bg-zinc-600/50 rounded-lg p-1">
                      <button
                        onClick={() => setCfg({ ...cfg, staticType: 'solid' })}
                        className={`px-2 py-1 text-xs rounded-md transition-all ${cfg.staticType === 'solid'
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-600/50'
                          }`}
                      >
                        <Square size={12} />
                      </button>
                      <button
                        onClick={() => setCfg({ ...cfg, staticType: 'gradient' })}
                        className={`px-2 py-1 text-xs rounded-md transition-all ${cfg.staticType === 'gradient'
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-600/50'
                          }`}
                      >
                        <SquareChartGantt size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="color"
                        value={cfg.bgColor}
                        onChange={e => setCfg({ ...cfg, bgColor: e.target.value })}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        title="Renk seç"
                      />
                      <div
                        className="h-8 rounded-md transition-all duration-200 cursor-pointer hover:shadow-lg relative z-0"
                        style={{
                          background: cfg.staticType === 'gradient'
                            ? `linear-gradient(135deg, ${cfg.bgColor} 0%, rgba(0,0,0,0.85) 100%)`
                            : cfg.bgColor,
                          boxShadow: 'inset 0 0 0 1px rgba(113, 113, 122, 0.3)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
