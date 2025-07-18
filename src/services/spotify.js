const SpotifyWebApi = require('spotify-web-api-node');
const { overlayWin, mainWin } = require('../core/windows');
const credentials = require('../services/credentials');
const { refreshToken } = require('../oauth');
const { ipcMain } = require('electron');
const EventEmitter = require('events');

let client, poller;

async function ensureToken() {
  // web-api-node >=10:  getAccessTokenExpirationTimestampMs
  const exp = client?.getAccessTokenExpirationTimestampMs?.();
  const willExpire = exp ? exp < Date.now() + 60_000 : false; // 1 dk erken yenile

  if (!client.getAccessToken() || willExpire) {
    const data = await client.refreshAccessToken();
    client.setAccessToken(data.body['access_token']);
  }
}


/* ───── EK API YARDIMCILARI ───── */
async function getAudioFeatures(id) {
  await ensureToken();
  try {
    const r = await client.getAudioFeaturesForTrack(id);
    return r.body;                         // tempo vs.
  } catch (err) {
    console.error('getAudioFeatures failed',
      { id, status: err?.statusCode, message: err?.message });
    return null;                           // renderer “— BPM” gösterir
  }
}

async function getArtist(id) {
  await ensureToken();
  const r = await client.getArtist(id);
  if (r.status === 401) {
    await ensureToken();
    return getArtist(id);
  }
  return r.body;                       // { genres:[…], name,… }
}

async function getQueue() {
  await ensureToken();
  const r = await fetch('https://api.spotify.com/v1/me/player/queue', {
    headers: { Authorization: `Bearer ${client.getAccessToken()}` }
  });
  if (r.status === 401) {
    await ensureToken();
    return getQueue();
  }
  if (!r.ok) throw new Error('queue ' + r.status);
  const data = await r.json();
  /* Fallback: ilk sıradaki parça mevcut değilse currently_playing’i kullan */
  if (!data.queue?.length && data.currently_playing)
    data.queue = [data.currently_playing];
  return data;
}


async function getPlaylist(id) {
  await ensureToken();
  const r = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: { Authorization: `Bearer ${client.getAccessToken()}` }
  });
  if (r.status === 401) {
    await ensureToken();
    return getPlaylist(id);
  }
  if (!r.ok) throw new Error('playlist ' + r.status);
  return r.json();
}


let connected = false;
const emitter = new EventEmitter();

// Hızlı güncelleme için immediate update fonksiyonu
let immediateUpdateRequested = false;

async function requestImmediateUpdate() {
  if (!connected || !client) return;
  
  immediateUpdateRequested = true;
  
  try {
    await ensureToken();
    const now = await client.getMyCurrentPlaybackState();
    overlayWin()?.webContents.send('spotify:now', now.body);
    mainWin()?.webContents.send('spotify:now', now.body);
    emitter.emit('spotify:now', now.body);
  } catch (err) {
    console.error('Immediate update error', err);
  }
  
  immediateUpdateRequested = false;
}

async function setup(tokens = credentials.get()) {
  connected = false;

  // normalize: access_token → accessToken
  if (!tokens.accessToken && tokens.access_token) {
    tokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000 - 60000
    };
    credentials.save(tokens);
  }

  if (!tokens.accessToken) {
    return;
  }

  client = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
  client.setAccessToken(tokens.accessToken);
  client.setRefreshToken(tokens.refreshToken);

  if (poller) clearInterval(poller);
  poller = setInterval(async () => {
    // Eğer immediate update yapılmışsa bu cycle'ı atla
    if (immediateUpdateRequested) return;
    
    try {
      if (Date.now() > tokens.expiresAt) {
        try {
          const newTokens = await refreshToken(tokens.refreshToken);

          if (!newTokens.accessToken) {
            console.error('[Spotify] refresh başarısız – accessToken yok');
            connected = false;
            clearInterval(poller);
            poller = null;
            mainWin()?.webContents.send('spotify:disconnected');
            overlayWin()?.webContents.send('spotify:disconnected');
            emitter.emit('spotify:disconnected');
            return;
          }

          credentials.save(newTokens);
          client.setAccessToken(newTokens.accessToken);
          tokens = newTokens;

        } catch (err) {
          console.error('[Spotify] refreshToken hata:', err.message || err);
          connected = false;
          emitter.emit('spotify:disconnected');
          return;
        }
      }

      const now = await client.getMyCurrentPlaybackState();
      overlayWin()?.webContents.send('spotify:now', now.body);
      mainWin()?.webContents.send('spotify:now', now.body);
      emitter.emit('spotify:now', now.body);

    } catch (err) {
      console.error('Spotify poll error', err);
    }
  }, 1500); // 2000ms'den 1500ms'ye düşürdük

  connected = true;
  mainWin()?.webContents.send('spotify:connected');
  emitter.emit('spotify:connected');

  /* ───── IPC bridge ─ renderer çağrıları ───── */
  const register = (channel, fn) => {
    try { ipcMain.handle(channel, fn); }       // ilk çalıştırmada OK
    catch (e) { /* Already registered - ignore */ }
  };

  register('spotify:prev', async () => {
    await ensureToken();
    const result = await client.skipToPrevious();
    // Biraz bekleyip veriyi güncelleyelim
    setTimeout(() => requestImmediateUpdate(), 150);
    return result;
  });

  register('spotify:next', async () => {
    await ensureToken();
    const result = await client.skipToNext();
    // Biraz bekleyip veriyi güncelleyelim
    setTimeout(() => requestImmediateUpdate(), 150);
    return result;
  });

  register('spotify:togglePlay', async () => {
    await ensureToken();
    const { body } = await client.getMyCurrentPlaybackState();
    const result = body?.is_playing ? await client.pause() : await client.play();
    // Play state değişikliğini hemen güncelleyelim
    setTimeout(() => requestImmediateUpdate(), 100);
    return result;
  });

  register('spotify:setVolume', async (_e, vol) => {
    await ensureToken();
    return client.setVolume(Math.max(0, Math.min(vol, 100)));
  });

  register('spotify:requestImmediateUpdate', async () => {
    return requestImmediateUpdate();
  });

  register('spotify:audioFeatures', (_e, id) => getAudioFeatures(id));
  register('spotify:artist', (_e, id) => getArtist(id));
  register('spotify:queue', () => getQueue());
  register('spotify:playlist', (_e, id) => getPlaylist(id));

}

module.exports = {
  setup,
  isConnected: () => connected,
  onConnected: cb => emitter.on('spotify:connected', cb),
  onDisconnected: cb => emitter.on('spotify:disconnected', cb),
  onNow: cb => emitter.on('spotify:now', cb),
  requestImmediateUpdate,

  /* yeni public API */
  getAudioFeatures,
  getArtist,
  getQueue,
  getPlaylist,
};

