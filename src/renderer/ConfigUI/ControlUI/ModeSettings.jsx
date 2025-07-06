// src/renderer/ControlUI/ModeSettings.jsx
import React, { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';

const simpleOpts = [
  { id: 'showCurrent',  label: 'Çalan Şarkı ve Kapak' },
  { id: 'showBPM',      label: 'BPM Göster' },
  { id: 'showNext',     label: 'Sıradaki Şarkı' },
  { id: 'showPlaylist', label: 'Playlist Adı' },
];

export default function ModeSettings({ cfg, setCfg }) {
  const [tab, setTab] = useState('simple');
  const tabs = [
    { id: 'simple',  label: 'Simple' },
    { id: 'modular', label: 'Modular' },
  ];
  const opts = tab === 'simple' ? simpleOpts : [];

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
                  onClick={() => setTab(t.id)}
                  className={`pb-2 text-sm font-semibold tracking-wide uppercase transition-colors ${
                    isActive
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

      {/* Options */}
      <div className="divide-y divide-zinc-700">
        {opts.map(o => (
          <div
            key={o.id}
            className="flex items-center justify-between py-3 hover:bg-zinc-700/20"
          >
            <span className="text-white font-medium">{o.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!cfg[o.id]}
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
          </div>
        ))}
      </div>
    </div>
  );
}
