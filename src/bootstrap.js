const { app, ipcMain, shell, BrowserWindow, dialog } = require('electron');
const path   = require('path');
require('dotenv').config();

/* ---------- Sabitler ---------- */
const SCHEME = 'spover'; 
const PORT   = Number(process.env.OAUTH_PORT) 
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const IS_DEV = !app.isPackaged;

/* ---------- Uygulama tekil instance & deep‑link kaydı ---------- */
if (IS_DEV) {
  app.setAsDefaultProtocolClient(
    SCHEME,
    process.execPath,
    [path.resolve(process.argv[1])]
  );
} else {
  app.setAsDefaultProtocolClient(SCHEME);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
  return;
}

const firstLink = process.argv.find(a => a.startsWith(`${SCHEME}://`));

/* ============================================================= */
async function bootstrap() {
  /* 1) OAuth loopback sunucusunu başlat */
  try {
    const { start } = require('./core/authServer');
    await start(PORT);                      // EADDRINUSE ise kendi içinde dialog gösterir
  } catch (err) {
    dialog.showErrorBox('Spover – OAuth', err.message || String(err));
    return;                                 // kritik, UI açma
  }

  /* 2) Spotify protocol init (PKCE, state…) */
  const protocol = require('./core/protocol');
  protocol.init({ REDIRECT_URI });          // global.handleOAuthCallback atanır

  /* 3) Pencereler & tray */
  require('./core/windows');
  require('./core/tray');

  /* 4) Ayarlar servisi (opsiyonel hata yakalama) */
  try { require('./services/settings'); }
  catch (err) { console.error('[Settings] load error:', err); }

  /* 5) Spotify servisi & IPC köprüleri */
  try {
    const spotify = require('./services/spotify');
    spotify.setup().catch(e => console.error('[Spotify] setup err:', e));

    ipcMain.handle('spotify:status', () => spotify.isConnected());
    ipcMain.handle('spotify:login', () => {
      const { buildSpotifyAuthURL } = require('./core/protocol');
      shell.openExternal(buildSpotifyAuthURL());
    });
  } catch (err) {
    console.error('[Spotify] service load error:', err);
  }

  /* 6) Deep‑link ile ilk çalıştırma */
  if (firstLink) global.handleOAuthCallback(firstLink);
}

app.whenReady().then(bootstrap);

/* ---------- Tekrar çalışan instance / macOS open-url ---------- */
app.on('second-instance', (_e, argv) => {
  const url = argv.find(a => a.startsWith(`${SCHEME}://`));
  if (url) global.handleOAuthCallback(url);
});
app.on('open-url', (_e, url) => global.handleOAuthCallback(url));

/* ---------- Renderer talebiyle OAuth başlat ---------- */
ipcMain.handle('oauth:begin', () => {
  const { buildSpotifyAuthURL } = require('./core/protocol');
  return shell.openExternal(buildSpotifyAuthURL());
});