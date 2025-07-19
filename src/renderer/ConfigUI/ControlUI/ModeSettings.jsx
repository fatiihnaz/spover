// src/renderer/ControlUI/ModeSettings.jsx
import React, { useState, useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';

const simpleOpts = [
  { id: 'showCurrent', label: 'Çalan Şarkı ve Kapak', availability: 'y' },
  { id: 'showNext', label: 'Sıradaki Şarkı', availability: 'y' },
  { id: 'showPlaylist', label: 'Playlist Adı', availability: 'y' },
  { id: 'showBPM', label: 'BPM Göster', availability: 'n' },
];

export default function ModeSettings({ cfg, setCfg }) {
  const [tab, setTab] = useState('simple');
  const [showModularWarning, setShowModularWarning] = useState(false);

  const tabs = [
    { id: 'simple', label: 'Simple' },
    { id: 'modular', label: 'Modular' },
  ];
  const opts = tab === 'simple' ? simpleOpts : [];

  const handleTabChange = (tabId) => {
    if (tabId === 'modular') {
      setTab('modular'); // Önce modular tab'a geç
      setShowModularWarning(true);
      setTimeout(() => {
        setTab('simple');
        setShowModularWarning(false);
      }, 1000);
    } else {
      setTab(tabId);
    }
  };

  return (
    <div className="px-4 py-2">
      <h2 className="text-lg font-semibold mb-2">Mode</h2>

      {/* Tabs */}
      <LayoutGroup>
        <nav className="flex space-x-6 border-b border-zinc-700 mb-4">
          {tabs.map(t => {
            const isActive = t.id === tab;
            return (
              <div key={t.id} className="relative">
                <button
                  onClick={() => handleTabChange(t.id)}
                  className={`pb-2 text-sm font-semibold tracking-wide uppercase transition-colors ${isActive
                      ? 'text-green-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {t.label}
                </button>
                {isActive && (
                  <motion.div
                    layoutId="modeTabsIndicator"
                    className="absolute left-0 right-0 bottom-0 h-1 bg-green-400 rounded-t"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </LayoutGroup>

      {/* Modular Warning */}
      {showModularWarning && (
        <div className="bg-zinc-600/30 border border-zinc-600/50 rounded-lg py-2 px-4">
          <div className="flex items-center space-x-2">
            <TriangleAlert size={12} className='text-zinc-400' />
            <span className="text-zinc-400 text-sm">
              Bu fonksiyon henüz kullanıma hazır değil.
            </span>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="divide-y divide-zinc-700">
        {opts.map(o => (
          <div
            key={o.id}
            className={`flex items-center justify-between py-3 hover:bg-zinc-700/20 ${
              o.availability === 'n' ? 'opacity-40 relative' : ''
            }`}
          >
            <span className="text-white font-medium">{o.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!cfg[o.id]}
                disabled={o.availability === 'n'}
                onChange={e => setCfg({ ...cfg, [o.id]: e.target.checked })}
              />
              <div className="
                w-11 h-6 bg-zinc-600 
                peer-focus:ring-2 peer-focus:ring-green-500
                rounded-full peer
                peer-checked:bg-green-600
                transition-colors duration-200
              " />
              <div className="
                absolute left-[2px] top-[2px]
                w-5 h-5 bg-white
                rounded-full
                peer-checked:translate-x-5
                transition-transform duration-200
              " />
            </label>
            {o.availability === 'n' && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/80">
                <span className="text-zinc-300 text-sm font-medium">Mevcut değil</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
