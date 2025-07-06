const { BrowserWindow } = require('electron');
require('dotenv').config();
const crypto = require('crypto');
const fetch = global.fetch;              // Node 20+

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SCOPE = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'user-read-email',
].join(' ');

let REDIRECT_URI;         // bootstrap > init()
let pkceVerifier;         // PKCE – later use

/* helpers ----------------------------------------------------*/
const b64url = b => b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
let pendingState = null;

function createPKCE() {
  pkceVerifier = b64url(crypto.randomBytes(32));
  return b64url(crypto.createHash('sha256').update(pkceVerifier).digest());
}

/* 1) authorize URL ------------------------------------------*/
function buildSpotifyAuthURL() {
  pendingState = Math.random().toString(36).slice(2, 10);
  const qs = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPE,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: createPKCE(),
    state: pendingState,
  });
  return `https://accounts.spotify.com/authorize?${qs}`;
}

/* 2) code ▶ token  ------------------------------------------*/
async function exchangeToken(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: pkceVerifier,
    client_id: CLIENT_ID,
  });

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) throw new Error(`token ${r.status} – ${await r.text()}`);
  return r.json();
}

/* 3) deep-link handler --------------------------------------*/
async function handleOAuthCallback(url) {
  try {
    const u = new URL(url);
    const code = u.searchParams.get('code');
    const state = u.searchParams.get('state');

    // ---------- STATE DOĞRULAMASI ----------
    if (!pendingState || state !== pendingState) {
      throw new Error('STATE_MISMATCH');
    }
    pendingState = null;
    if (!code) return;

    const tokens = await exchangeToken(code);
    const credentials = require('../services/credentials');
    credentials.save(tokens);
    require('../services/spotify').setup(tokens);
    BrowserWindow.getAllWindows()[0]
      ?.webContents.send('spotify:connected');
  } catch (err) {
    console.error('[oauth]', err);
    BrowserWindow.getAllWindows()[0]
      ?.webContents.send('oauth:error', err.message);
  }
}

/* 4) public API ---------------------------------------------*/
module.exports = {
  init({ REDIRECT_URI: uri }) {
    REDIRECT_URI = uri;
    global.handleOAuthCallback = handleOAuthCallback;
  },
  buildSpotifyAuthURL,
  handleOAuthCallback,
};
