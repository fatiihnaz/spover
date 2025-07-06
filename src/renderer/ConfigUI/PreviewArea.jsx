// PreviewArea.jsx — klasik / builder preview (overlay oranına uygun)
import React from 'react';

export default function PreviewArea({ cfg, activeTab }) {
  /* ───── MODULAR BUILDER (Mode Sekmesi) ───── */
  if (activeTab === 'mode') {
    // Overlay kutumuz normalde 2:1 oranında (width : height = 2)
    // Burada büyük bir maket gösteriyoruz: genişliği ekranın %60’ı, yüksekliği %30’u
    const W = 60;   // genişlik %
    const H = 30;   // yükseklik % (2:1 oranı korunur → W / H == 2)

    const container = {
      width: `${W}%`,
      height: `${H}%`,
      backgroundColor: cfg.bgColor,
      opacity: cfg.opacity,
      borderRadius: 14,
      display: 'grid',
      gap: 4,
      pointerEvents: 'auto', // drag‑drop’a hazır
      gridTemplateColumns: cfg.orientation === 'vertical' ? '1fr' : 'repeat(3, 1fr)',
      gridTemplateRows: cfg.orientation === 'vertical' ? 'repeat(3, 1fr)' : '1fr',
    };

    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div style={container}>
          {[0, 1, 2].map(i => (
            <div key={i}
              className="border-2 border-dashed border-white/15 rounded flex items-center justify-center text-sm text-white/60">
              Bölme {i + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ───── KLASİK PREVIEW (Overlay Sekmesi) ───── */
  const { width: SW, height: SH } = window.screen;
  const relX = (cfg.pos?.x ?? 0) / SW;      // 0-1
  const relY = (cfg.pos?.y ?? 0) / SH;

  const VIS = Math.min(cfg.scale, 1.6);
  const boxW = Math.max(200, Math.min(260 * VIS, 600));
  const boxH = boxW / 3;                   // 2 : 1 oran

  const widthPct = (boxW / SW) * 100;
  const heightPct = (boxH / SH) * 100;

  const boxStyle = {
    position: 'absolute',
    pointerEvents: 'none',
    borderRadius: 8,
    backgroundColor: cfg.bgColor,
    opacity: cfg.opacity,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    top: `${relY * 100}%`,
    left: `${relX * 100}%`,
    /* merkez düzeltmesi YOK; pos sol-üst köşe */
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-4/5 aspect-video border-2 border-dashed rounded-md relative">
        <div style={boxStyle} />
      </div>
    </div>
  );
}
