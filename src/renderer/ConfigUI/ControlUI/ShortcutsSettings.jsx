// src/renderer/ControlUI/ShortcutsSettings.jsx
import { motion, AnimatePresence } from 'framer-motion';
import useShortcutCapture from '../../../hooks/useShortcutCapture';
import { X } from 'lucide-react';

const ROWS = [
  { id: 'cycle', label: 'Overlay Mod Değiştir' },
  { id: 'toggle', label: 'Overlay Aç / Kapat' },
  { id: 'drag', label: 'Taşı-Modu (Sürükle)' },
  { id: 'ctrl', label: 'Kontrol Paneli' },
];

function errorText(code) {
  return {
    reserved: 'Sistem kısayolu, kullanılamaz',
    duplicate: 'Bu tuş zaten atanmış',
    invalid: 'Geçersiz kombinasyon.',
    'electron-fail': 'Electron kabul etmedi',
  }[code] ?? 'Hata';
}

export default function ShortcutsSettings() {

  const { map, capturing, setCapturing, errors } = useShortcutCapture();

  return (
    <div className="px-4 py-2">
      <h2 className="text-lg font-semibold mb-2">Kısayollar</h2>

      <div className="divide-y divide-zinc-700">
        {ROWS.map(r => (
          <div className="flex flex-col gap-1">
            <div key={r.id} className="flex items-center justify-between py-3 hover:bg-zinc-700/20">
              <span className="font-medium">{r.label}</span>
              <div className="flex items-center gap-2">
                <input readOnly value={map[r.id] || ''} placeholder="⌘ ⇧ O" className="w-32 bg-zinc-600/50 rounded px-2 py-1 text-center text-sm" />
                <button className={`text-sm px-3 py-1 rounded min-w-14 min-h-7 text-center
                  ${capturing === r.id
                    ? 'bg-red-700 animate-pulse'
                    : 'bg-zinc-700 hover:bg-zinc-600'}`}
                  onClick={() => setCapturing(capturing === r.id ? null : r.id)}>
                  {capturing === r.id ? <X size={16} strokeWidth={1.25} className="mx-auto" /> : 'Ata'}
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {errors[r.id] && (
                <motion.span
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-red-400 text-xs -mt-2.5 mb-1.5 text-right"
                >
                  {errorText(errors[r.id])}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
        <button className="flex w-full my-4 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-md items-center justify-center" onClick={async () => {const defaults = await window.shortcuts.reset();}}>
          Varsayılanlara dön
        </button>
      </div>
    </div>
  );
}
