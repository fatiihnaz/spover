const { app, Tray, Menu } = require('electron');
const path = require('path');
const { mainWin } = require('./windows');

function createTray() {
  const appPath = app.getAppPath();
  const iconPath = path.join(appPath, 'public', 'icon.png');

  const tray = new Tray(iconPath);
  const menu = Menu.buildFromTemplate([
    { label: 'Ayarları Aç', click: () => mainWin()?.show() },
    { type: 'separator' },
    { label: 'Çıkış', click: () => app.quit() },
  ]);

  tray.setToolTip('Spotify Overlay');
  tray.setContextMenu(menu);
}

app.whenReady().then(createTray);
