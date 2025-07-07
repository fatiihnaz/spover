const { app, BrowserWindow, screen, ipcMain } = require('electron');
const { globalShortcut } = require('electron');
const path = require('path');
const url = require('url');

let mainWin, overlayWin;
const isDev = !app.isPackaged;

function createMainWindow() {
  const appPath = app.getAppPath();
  mainWin = new BrowserWindow({
    width: 420,
    height: 340,
    frame: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
      preload: path.join(appPath, 'src', 'preload', 'index.js'),
    },
  });

  if (isDev) {
    mainWin.loadURL('http://localhost:5173');
  } else {
    mainWin.loadFile(path.join(appPath, 'dist', 'index.html'));
  }

  mainWin.once('ready-to-show', () => mainWin.show());

  mainWin.on('focus', () => overlayWin?.hide());
  mainWin.on('blur', () => overlayWin?.showInactive());
}

function createOverlay() {
  const appPath = app.getAppPath();
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWin = new BrowserWindow({
    show: false,
    x: 0, y: 0, width, height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    contentProtection: true,
    thickFrame: false, 
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
      preload: path.join(appPath, 'src', 'preload', 'index.js'),
    },
  });

  overlayWin.setIgnoreMouseEvents(true, { forward: true });

  if (isDev) {
    overlayWin.loadURL('http://localhost:5173/#/overlay');
  } else {
    const indexPath = path.join(appPath, 'dist', 'index.html');
    const overlayUrl = url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true,
      hash: '/overlay'
    });
    overlayWin.loadURL(overlayUrl);
  }

  overlayWin.once('ready-to-show', () => overlayWin.showInactive());
}

app.whenReady().then(() => {
  createOverlay();
  createMainWindow();

  require('../services/shortcuts').init();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// pencere kontrol IPC’leri…
ipcMain.handle('window:minimize', () => mainWin.minimize());
ipcMain.handle('window:maximize', () => mainWin.isMaximized() ? mainWin.unmaximize() : mainWin.maximize());
ipcMain.handle('window:closeApp', () => app.quit());
ipcMain.handle('window:hideMain', () => {
  mainWin.hide();
  overlayWin.setIgnoreMouseEvents(true, { forward: true });
  overlayWin.setFocusable(false); 
  overlayWin.showInactive();
});
ipcMain.on('overlay:exit-drag', () => overlayWin?.setIgnoreMouseEvents(true, { forward: true }));
ipcMain.on('overlay:exit-control', () => overlayWin?.setIgnoreMouseEvents(true, { forward: true }));
ipcMain.on('overlay:set-control-region', (_e, rect) => {
  // rect = { x, y, width, height }
  // forward: true geri kalan tıklamaları underlying pencereye iletir
  overlayWin.setIgnoreMouseEvents(true, { forward: true, region: [rect] });
});



module.exports = { mainWin: () => mainWin, overlayWin: () => overlayWin };
