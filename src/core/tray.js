const { app, Tray, Menu } = require('electron');
const path = require('path');
const { mainWin } = require('./windows');

// Store tray as a global variable to prevent garbage collection
let tray = null;

function createTray() {
  const appPath = app.getAppPath();
  
  // Better path handling for production vs development
  let iconPath;
  if (process.env.NODE_ENV === 'development') {
    iconPath = path.join(appPath, 'public', 'spover.ico');
  } else {
    // In production, resources are in different locations depending on platform
    if (process.platform === 'darwin') {
      iconPath = path.join(process.resourcesPath, 'public', 'spover.icns');
    } else {
      iconPath = path.join(appPath, 'build', 'spover.ico'); 
      // Alternative paths to try if the above doesn't work:
      // iconPath = path.join(appPath, 'public', 'spover.ico');
      // iconPath = path.join(process.resourcesPath, 'spover.ico');
    }
  }

  try {
    tray = new Tray(iconPath);
    const menu = Menu.buildFromTemplate([
      { label: 'Ayarları Aç', click: () => mainWin()?.show() },
      { type: 'separator' },
      { label: 'Çıkış', click: () => app.quit() },
    ]);

    tray.setToolTip('Spotify Overlay');
    tray.setContextMenu(menu);
  } catch (error) {
  }
}

// Make sure to create tray after app is ready
app.whenReady().then(createTray);

// Prevent the tray from being garbage collected by exporting it
module.exports = { getTray: () => tray };