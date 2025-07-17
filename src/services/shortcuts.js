const { globalShortcut, ipcMain } = require('electron');
const settings = require('./settings');
const { overlayWin, mainWin } = require('../core/windows');
const { standardize, hasConflict } = require('../utils/shortcutGuards');

let registered = {};  // { id: shortcut }
let paused = false;

const ACTIONS = {
  cycle: () => overlayWin()?.webContents.send('overlay:cycle-mode'),
  toggle: () => {
    const win = overlayWin();
    if (!win) return;
    win.isVisible() ? win.hide() : win.showInactive();
  },
  drag: () => {
    const win = overlayWin();
    win?.webContents.send('overlay:enter-drag');
  },
  ctrl: () => {
    const win = overlayWin();
    win?.webContents.send('overlay:enter-control');
  },
};

let dirty = false;

function broadcastError(payload) {
  [overlayWin(), mainWin()].forEach(w =>
    w?.webContents.send('shortcuts:error', payload));
}

function unregisterAll() {
  globalShortcut.unregisterAll();
  registered = {};
}


function registerAll(map) {
  // Eski kısayolları temizle
  if (paused) return;
  unregisterAll();

  Object.entries(map).forEach(([id, shortcut]) => {
    if (!shortcut || !ACTIONS[id]) return;   // boş veya bilinmeyen

    const { [id]: _, ...others } = map;          // kendi kaydını hariç tut
    const reason = hasConflict(shortcut, others);

    if (reason) {
      broadcastError({ id, shortcut, reason });
      delete map[id];           // kirli config’ten sil
      dirty = true;
      return;
    }

    try {
      const ok = globalShortcut.register(shortcut, () => ACTIONS[id]());
      if (ok) registered[id] = shortcut;
      else throw new Error('register() false');
    } catch (err) {
      console.warn(`[shortcuts] '${shortcut}' geçersiz, temizleniyor`);
      broadcastError({ id, shortcut, reason: 'electron-fail' });
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
  ipcMain.handle('shortcuts:pause', () => {
    if (!paused) {
      paused = true;
      unregisterAll();
    }
  });

  ipcMain.handle('shortcuts:resume', () => {
    if (paused) {
      paused = false;
      registerAll(settings.get().shortcuts);
    }
  });
}

module.exports = { init };