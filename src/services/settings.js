// src/services/settings.js
const Store = require('electron-store').default;
const { ipcMain, BrowserWindow } = require('electron');
const { overlayWin } = require('../core/windows');

const isMac = process.platform === 'darwin';

const schema = {
  pos: {
    type: 'object',
    default: { x: 0, y: 0 }
  },
  opacity: { type: 'number', default: 0.8 },
  scale: { type: 'number', default: 1 },

  bgMode: { type: 'string', default: 'static' },
  bgColor: { type: 'string', default: '#000000' },

  showCurrent: { type: 'boolean', default: true },
  showBPM: { type: 'boolean', default: false },
  showNext: { type: 'boolean', default: false },
  showPlaylist: { type: 'boolean', default: false },

  shortcuts: {
    type: 'object',
    default: {
      cycle: `${isMac ? 'Command' : 'Control'}+O`,
      toggle: `${isMac ? 'Command' : 'Control'}+Shift+O`,
      drag: `${isMac ? 'Command' : 'Control'}+D`,
      ctrl: `${isMac ? 'Command' : 'Control'}+K`,
    },
  },
};

const store = new Store({ schema });

const defaultShortcuts = schema.shortcuts.default;

ipcMain.handle('settings:reset-shortcuts', () => {
  store.set('shortcuts', defaultShortcuts);
  const newSc = store.get('shortcuts');

  // Açık tüm pencerelere güncel ayarı yolla
  BrowserWindow.getAllWindows()
    .filter(w => !w.isDestroyed())
    .forEach(w => {w.webContents.send('settings:changed', { shortcuts: newSc }); w.webContents.send('shortcuts:changed', newSc);});

  return newSc;
});

ipcMain.handle('settings:get', () => store.store);
ipcMain.on('settings:set', (event, data) => {
  BrowserWindow.getAllWindows()
    .filter(w => w.webContents !== event.sender && !w.isDestroyed())
    .forEach(w => w.webContents.send('settings:changed', data));
  store.set(data);
});

module.exports = {
  get: () => store.store,
  save: d => store.set(d),
};
