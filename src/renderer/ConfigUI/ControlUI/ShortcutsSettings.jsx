// src/renderer/ControlUI/ShortcutsSettings.jsx
import React, { useEffect, useState } from 'react';

const ROWS = [
  { id: 'cycle', label: 'Overlay Mod Değiştir' },
  { id: 'toggle', label: 'Overlay Aç / Kapat' },
  { id: 'drag', label: 'Taşı-Modu (Sürükle)' },
  { id: 'ctrl', label: 'Kontrol Paneli' },
];

export default function ShortcutsSettings() {
  const [map, setMap] = useState({});
  const [capturing, setCapturing] = useState(null);

  // yükle + listener
  useEffect(() => {
    window.shortcuts?.get()?.then(setMap);
    const off = window.shortcuts?.onChange?.(setMap);
    return () => off && off();
  }, []);

  // tuş yakalama
  useEffect(() => {
    if (!capturing) return;

    function onKeyDown(e) {
      e.preventDefault();
      e.stopPropagation();

      // ➊ Sadece modifier’a basıldıysa bekle (combine etmek için)
      const modifierCodes = [
        'ControlLeft', 'ControlRight',
        'ShiftLeft', 'ShiftRight',
        'AltLeft', 'AltRight',
        'MetaLeft', 'MetaRight'
      ];
      if (modifierCodes.includes(e.code)) return;     // henüz tamamlamıyoruz

      // ➋ Modifier’ları sıraya ekle
      const parts = [];
      if (e.metaKey) parts.push('Command');
      if (e.ctrlKey) parts.push('Control');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');

      // ➌ Ana tuş
      const key =
        e.code.startsWith('Key') ? e.key.toUpperCase() :
          e.code.startsWith('Digit') ? e.key :
            e.code.includes('Arrow') ? e.code.replace('Arrow', '') :
              e.code;                     // F1, Escape, MediaNextTrack…
      parts.push(key);

      // ➍ Çiftleri ayıkla → örn. Control + A
      const accel = Array.from(new Set(parts)).join('+');

      const next = { ...map, [capturing]: accel };
      setMap(next);
      window.shortcuts?.set?.({ [capturing]: accel });
      setCapturing(null);
    }

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [capturing, map]);

  return (
    <div className="px-4 py-2">
      <h2 className="text-lg font-semibold mb-2">Kısayollar</h2>

      <div className="divide-y divide-zinc-700">
        {ROWS.map(r => (
          <div
            key={r.id}
            className="flex items-center justify-between py-3 hover:bg-zinc-700/20"
          >
            <span className="font-medium">{r.label}</span>

            <div className="flex items-center gap-2">
              <input
                readOnly
                value={map[r.id] || ''}
                placeholder="⌘ ⇧ O"
                className="w-32 bg-zinc-600/50 rounded px-2 py-1 text-center text-sm"
              />
              <button
                className={`text-sm px-3 py-1 rounded
                            ${capturing === r.id
                    ? 'bg-emerald-600 animate-pulse'
                    : 'bg-zinc-700 hover:bg-zinc-600'}`}
                onClick={() => setCapturing(r.id)}
              >
                {capturing === r.id ? 'Ata' : 'Ata'}
              </button>
            </div>
          </div>
        ))}
        <button className="flex w-full my-4 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md items-center justify-center" onClick={() => window.shortcuts?.set?.({ cycle: null, toggle: null })}>
          Varsayılanlara dön
        </button>
      </div>
    </div>
  );
}
