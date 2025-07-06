// src/services/settings.js
const Store = require('electron-store').default;
const { ipcMain, BrowserWindow } = require('electron');
const { overlayWin } = require('../core/windows');

const schema = {
  // Overlay konumu ve boyutu
  pos: {
    type: 'object',
    default: { x: 0, y: 0 }
  },
  opacity: { type: 'number', default: 0.8 },
  scale: { type: 'number', default: 1 },

  // Background: static mi reactive mi, ve statik renge ait hex
  bgMode: { type: 'string', default: 'static' },    // 'static' | 'reactive'
  bgColor: { type: 'string', default: '#000000' },

  // Hangi modüller görünsün
  showCurrent: { type: 'boolean', default: true },
  showBPM: { type: 'boolean', default: false },
  showNext: { type: 'boolean', default: false },
  showPlaylist: { type: 'boolean', default: false },

  shortcuts: {
    type: 'object',
    default: {
      cycle: 'CommandOrControl+Shift+O',
      toggle: 'CommandOrControl+O',
      drag: 'CommandOrControl+D',
      ctrl: 'CommandOrControl+K',
    },
  },
};
const store = new Store({ schema });

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
