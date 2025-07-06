// src/renderer/ControlPanel.jsx
import React, { Suspense, useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';

import OverlaySettings from './ControlUI/OverlaySettings';
import ModeSettings from './ControlUI/ModeSettings';
import ShortcutsSettings from './ControlUI/ShortcutsSettings';

export default function ControlPanel({ cfg, setCfg, tab, setTab }) {
  const tabs = [
    { id: 'overlay', label: 'Overlay', Comp: OverlaySettings },
    { id: 'mode', label: 'Mode', Comp: ModeSettings },
    { id: 'shortcuts', label: 'Shortcuts', Comp: ShortcutsSettings }
  ];

  return (
    <>
      {/* Animated tab navigation */}
      <nav className="sticky top-0 z-30 bg-zinc-800">
        <LayoutGroup>
          <div className="flex justify-center py-4">
            <div className="relative flex space-x-4 px-3 py-1 bg-zinc-900/60 border border-zinc-700 rounded-lg">
              {tabs.map(t => {
                const isActive = tab === t.id;
                return (
                  <div key={t.id} className="relative">
                    <button
                      onClick={() => setTab(t.id)}
                      className={`
                        relative z-10 px-4 py-1
                        text-sm font-semibold tracking-wide uppercase
                        transition-colors duration-200
                        ${isActive
                          ? 'text-white'
                          : 'text-white/60 hover:text-white'}
                      `}
                    >
                      {t.label}
                    </button>
                    {isActive && (
                      <motion.div
                        layoutId="tabIndicator"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute inset-0 bg-zinc-700 rounded-lg"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </LayoutGroup>
      </nav>

      {/* active section */}
      <div className="px-6 pb-10 space-y-8 flex-1">
        <Suspense fallback={<p>Loading…</p>}>
          {(() => {
            const Active = tabs.find(t => t.id === tab)?.Comp;
            return Active ? <Active cfg={cfg} setCfg={setCfg} /> : null;
          })()}
        </Suspense>
      </div>
    </>
  );
}
