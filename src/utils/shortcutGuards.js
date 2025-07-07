/******************************************************************************************
 * src/utils/shortcutGuards.js
 *
 * Klavye kısayollarının doğrulanması, normalizasyonu ve çakışma denetimi için yardımcı fonksiyonlar.
 * Hem Electron ana (main) hem de React renderer tarafında ortak kullanım için tasarlandı.
 *
 * Mevcut fonksiyonlar:
 *  - normalizeShortcut : Gelen kombinasyonu boşluksuz ve küçük harfe dönüştürür.
 *  - standardize       : Modifier eş-anlamlılarını birleştirir, yinelenen girdileri kaldırır ve öğeleri alfabetik sıraya sokar.
 *  - isValidShortcut   : En az bir modifier ve bir anahtar içerip içermediğini ve sadece alfanümerik karakterler kullanıldığını kontrol eder.
 *  - isModifierOnly    : Sadece modifier tuşlarından mı oluştuğunu kontrol eder (geçersiz kabul edilir).
 *  - RESERVED          : İşletim sistemi veya uygulama düzeyinde kritik olarak ayrılmış kısayolların standart listesi.
 *  - hasConflict       : Geçersiz (‘invalid’), rezerve (‘reserved’), daha önce tanımlanmış (‘duplicate’) veya çakışma yoksa null döner.
 *
 * Dışa aktarılanlar:
 *  - standardize
 *  - hasConflict
 ******************************************************************************************/

const normalizeShortcut = (shortcut = '') => shortcut.replace(/\s+/g, '').toLowerCase();

// Modifier anahtarlarının eş-anlamlılarını netleştirir
const MOD_ALIASES = {
  ctrl: 'ctrl',
  control: 'ctrl',
  controlleft: 'ctrl',
  controlright: 'ctrl',

  cmd: 'cmd',
  command: 'cmd',
  meta: 'cmd',
  metaleft: 'cmd',
  metaright: 'cmd',

  alt: 'alt',
  option: 'alt',
  altleft: 'alt',
  altright: 'alt',

  shift: 'shift',
  shiftleft: 'shift',
  shiftright: 'shift',
};

/**
 * Gelen kısayolu modifier sıralamasına ve tekrarsızlaştırmaya tabi tutar
 * @param {string} shortcut - normalize edilmiş ve bağlaçlardan ayrılmış kısayol
 * @returns {string} - alfabetik sıralı ve yinelenmeden arınmış kısayol kombinasyonu
 */
const standardize = (shortcut = '') => {
  if (!shortcut) return '';

  return [   // Ctrl+Shift+A → ['ctrl','shift','a'] → uniq → sort → join
    ...new Set(
      shortcut
        .split('+')
        .map(p => MOD_ALIASES[p.toLowerCase()] ?? p.toLowerCase())
        .filter(Boolean),
    ),
  ]
    .sort()
    .join('+');
};

/**
 * Geçerli bir kısayol formatı mı? En az bir modifier + bir tuş içermeli
 * @param {string} shortcut
 * @returns {boolean}
 */
const isValidShortcut = shortcut => {
  if (!shortcut) return false;
  const parts = shortcut.split('+');
  if (parts.length < 2) return false; // tek tuş → yetersiz

  return parts.every(p => /^[a-z0-9]+$/i.test(p));
};

/**
 * Yalnızca modifier tuşlarından mı oluşuyor? (Geçersiz sayılır)
 * @param {string} shortcut
 * @returns {boolean}
 */
const isModifierOnly = shortcut =>
  !!shortcut &&
  Object.keys(MOD_ALIASES).some(mod => shortcut.toLowerCase() === mod);

// İşletim sistemi tarafından ayrılmış kısayollar
const RESERVED = [
  'cmd+q',
  'ctrl+alt+delete',
  'alt+f4',
  'cmd+option+esc',
  'cmd+h',
  'cmd+m',
  'cmd+space',
  'ctrl+l',
  'ctrl+w',
  'cmd+w',
  'ctrl+s',
  'ctrl+c',
  'ctrl+v',
].map(standardize);

/**
 * Her türlü çakışma durumunu kontrol eder.
 * @param {string} shortcut - Kullanıcının girdiği kısayol
 * @param {Record<string,string>} existingShortcuts - Mevcut tanımlı kısayollar
 * @returns {'invalid'|'reserved'|'duplicate'|null}
 */
const hasConflict = (shortcut, existingShortcuts = {}) => {

  const normalizedShortcut = standardize(normalizeShortcut(shortcut));
  if (
    !normalizedShortcut ||
    !isValidShortcut(normalizedShortcut) ||
    isModifierOnly(normalizedShortcut)
  ) { return 'invalid';}

  if (RESERVED.includes(normalizedShortcut)) {return 'reserved';}

  const normalizedExisting = Object.values(existingShortcuts)
    .filter(Boolean)
    .map(keyCombo => standardize(normalizeShortcut(keyCombo)));

  if (normalizedExisting.includes(normalizedShortcut)) {return 'duplicate';}

  return null;
};
  
export {
  standardize,
  hasConflict
}