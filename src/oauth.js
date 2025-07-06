// src/oauth.js
require('dotenv').config();
const fetch = global.fetch;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

async function refreshToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method : 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : body.toString()
  }).then(r => r.json());

  return {
    accessToken : res.access_token,
    refreshToken,
    expiresAt   : Date.now() + res.expires_in * 1000 - 60_000
  };
}

module.exports = { refreshToken };
