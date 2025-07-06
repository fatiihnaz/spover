const { globalShortcut, ipcMain } = require('electron');
const settings = require('./settings');
const { overlayWin, mainWin } = require('../core/windows');

let registered = {};  // { id: accelerator }

const ACTIONS = {
  cycle: () => overlayWin()?.webContents.send('overlay:cycle-mode'),
  toggle: () => {
    const win = overlayWin();
    if (!win) return;
    win.isVisible() ? win.hide() : win.showInactive();
  },
  drag: () => {
    const win = overlayWin();
    win?.setIgnoreMouseEvents(false);                 // tıklamaları yakala
    win?.webContents.send('overlay:enter-drag');
  },
  ctrl: () => {
    const win = overlayWin();
    overlayWin().setIgnoreMouseEvents(false);
    win?.webContents.send('overlay:enter-control');
  },
};

let dirty = false;

function registerAll(map) {
  // Eski kısayolları temizle
  Object.values(registered).forEach(acc => globalShortcut.unregister(acc));
  registered = {};

  Object.entries(map).forEach(([id, accel]) => {
    if (!accel || !ACTIONS[id]) return;   // boş veya bilinmeyen
    try {
      const ok = globalShortcut.register(accel, () => ACTIONS[id]());
      if (ok) registered[id] = accel;
      else throw new Error('register() false');
    } catch (err) {
      console.warn(`[shortcuts] '${accel}' geçersiz, temizleniyor`);
      delete map[id];
      dirty = true;
    }
  });

  if (dirty) settings.save({ ...settings.get(), shortcuts: map });
}

function init() {
  const cfg = settings.get().shortcuts;
  registerAll(cfg);

  // Renderer’dan güncelleme istekleri
  ipcMain.handle('shortcuts:get', () => settings.get().shortcuts);
  ipcMain.on('shortcuts:set', (_e, map) => {
    const merged = { ...settings.get().shortcuts, ...map };
    settings.save({ ...settings.get(), shortcuts: merged });
    registerAll(merged);
    [overlayWin(), mainWin()].forEach(w =>
      w?.webContents.send('shortcuts:changed', merged));
  });
}

module.exports = { init };
