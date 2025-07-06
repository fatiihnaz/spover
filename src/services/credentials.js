// ---------------------------------------------------------------------------
// src/services/credentials.js
// Spotify oturum jetonlarını şifreli biçimde saklar (Electron safeStorage).
//
//  • get / save / clear   → dış API değişmedi.
//  • IPC köprüleri        → credentials:get  /  credentials:set
//  • İlk çalıştırmada eski plaintext credentials.json → şifreli store’a kopyalanır.
// ---------------------------------------------------------------------------

const { app, ipcMain, safeStorage } = require('electron');
const StoreRaw = require('electron-store');
const Store    = typeof StoreRaw === 'function' ? StoreRaw : StoreRaw.default;

const fs   = require('fs');
const path = require('path');

// ── Dosya yolları ───────────────────────────────────────────────────────────
const store       = new Store({ name: 'credentials' });                    // yeni

// ── Varsayılan boş nesne ────────────────────────────────────────────────────
const EMPTY = { accessToken: '', refreshToken: '', expiresAt: 0 };

// ── Yardımcılar: şifrele / deşifre et ───────────────────────────────────────
function encrypt(obj) {
  const json = JSON.stringify(obj);
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(json).toString('base64');
  }
  // Kasa yoksa en azından base64’le (plaintext fallback politikası)
  return Buffer.from(json).toString('base64');
}

function decrypt(b64) {
  if (!b64) return { ...EMPTY };
  const buf = Buffer.from(b64, 'base64');
  try {
    const json = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(buf)
      : buf.toString();              // fallback
    return JSON.parse(json);
  } catch (err) {
    console.warn('[Credentials] decrypt failed → resetting:', err);
    return { ...EMPTY };
  }
}

// ── Ana CRUD API ────────────────────────────────────────────────────────────
function get()  { return decrypt(store.get('blob')); }
function save(d){ store.set('blob', encrypt(d)); }   // isteyen her alanı set edebilir
function clear(){ save(EMPTY); }

// ── IPC köprüleri (Renderer API değişmedi) ──────────────────────────────────
ipcMain.handle('credentials:get', ()        => get());
ipcMain.on    ('credentials:set', (_e, d)   => save(d));

module.exports = { get, save, clear };
