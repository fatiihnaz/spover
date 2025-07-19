/**
 * Güvenlik önlemleri modülü
 * Preload seviyesinde DevTools, refresh ve diğer tehlikeli kısayolları engeller
 */

/**
 * Güvenlik önlemlerini aktif eder
 * Production modunda veya force edildiğinde çalışır
 * @param {boolean} forceInDev - Development modunda da aktif et
 */
function initSecurity(forceInDev = false) {
  const isProduction = !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
  
  // Geçici olarak development'ta da aktif et - test için
  if (!isProduction && !forceInDev) {
    console.log('Security skipped - development mode');
    return; // Development modunda ve force edilmemişse aktif etme
  }

  // Güvenlik önlemlerini hemen kur - document timing sorununu aş
  try {
    setupSecurity();
  } catch (error) {
    // Eğer hata olursa, bir timeout ile tekrar dene
    setTimeout(() => {
      try {
        setupSecurity();
      } catch (e) {
        console.warn('Security setup failed:', e);
      }
    }, 100);
  }
}

/**
 * Güvenlik önlemlerini kur
 */
function setupSecurity() {
  try {
    // Keyboard shortcut engelleme
    registerKeyboardBlocking();
    
    // Context menu engelleme
    registerContextMenuBlocking();
    
    // Console temizleme
    disableConsole();
    
    // DevTools açılma tespiti (opsiyonel)
    // startDevToolsDetection(); // Bu bazen problem yaratabilir, şimdilik kapalı
  } catch (error) {
    console.warn('Security setup error:', error);
  }
}

/**
 * Keyboard kısayollarını engelle
 */
function registerKeyboardBlocking() {
  if (typeof document === 'undefined') return; // Document yoksa çık
  
  const blockShortcuts = (e) => {
    try {
      // DevTools kısayolları - Windows ve Mac
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) || 
          (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) ||
          (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) || // Mac
          (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) || // Mac
          (e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c'))) { // Mac
        blockEvent(e);
        return false;
      }
      
      // Refresh kısayolları - Tüm varyasyonlar
      if (e.key === 'F5' || 
          (e.ctrlKey && (e.key === 'r' || e.key === 'R')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R')) ||
          (e.ctrlKey && e.key === 'F5') ||
          (e.metaKey && (e.key === 'r' || e.key === 'R')) || // Mac
          (e.metaKey && e.shiftKey && (e.key === 'r' || e.key === 'R'))) { // Mac
        blockEvent(e);
        return false;
      }

      // Diğer tehlikeli kısayollar - Windows ve Mac
      if ((e.ctrlKey && (e.key === 'u' || e.key === 'U')) || // View source
          (e.metaKey && (e.key === 'u' || e.key === 'U')) || // Mac View source
          (e.ctrlKey && (e.key === 'h' || e.key === 'H')) || // History
          (e.metaKey && (e.key === 'h' || e.key === 'H')) || // Mac History
          (e.ctrlKey && (e.key === 'w' || e.key === 'W')) || // Close window
          (e.metaKey && (e.key === 'w' || e.key === 'W')) || // Mac Close window
          (e.ctrlKey && (e.key === 'q' || e.key === 'Q')) || // Quit
          (e.metaKey && (e.key === 'q' || e.key === 'Q'))) { // Mac Quit
        blockEvent(e);
        return false;
      }
    } catch (error) {
      // Hata varsa da event'i engelle
      blockEvent(e);
      return false;
    }
  };

  document.addEventListener('keydown', blockShortcuts, true);
}

/**
 * Context menu'yu engelle
 */
function registerContextMenuBlocking() {
  if (typeof document === 'undefined') return; // Document yoksa çık
  
  const blockContextMenu = (e) => {
    try {
      blockEvent(e);
      return false;
    } catch (error) {
      // Hata olsa da engelle
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener('contextmenu', blockContextMenu, true);
}

/**
 * Event'i tamamen engelle
 * @param {Event} e - Event objesi
 */
function blockEvent(e) {
  try {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (e && typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
  } catch (error) {
    // Sessiz hata, event engelleme devam etsin
  }
}

/**
 * Console metodlarını devre dışı bırak
 */
function disableConsole() {
  if (typeof console !== 'undefined') {
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;
    console.trace = noop;
    console.table = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
    console.clear = noop;
  }
}

/**
 * DevTools açılma tespiti
 * Pencere boyutlarından DevTools açılıp açılmadığını anlar
 */
function startDevToolsDetection() {
  let devtools = {
    open: false,
    orientation: null
  };
  
  const checkInterval = setInterval(() => {
    // DevTools açık mı kontrol et (boyut farkından)
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    
    if (heightDiff > 160 || widthDiff > 160) {
      if (!devtools.open) {
        devtools.open = true;
        handleDevToolsDetected();
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // Cleanup için interval'i global olarak saklayabiliriz
  window._securityCheckInterval = checkInterval;
}

/**
 * DevTools tespit edildiğinde çalışır
 */
function handleDevToolsDetected() {
  console.log('DevTools detected and blocked!');
  
  // Opsiyonel: DevTools açıldığında uygulamayı kapat
  // if (window.windowCtrl?.closeApp) {
  //   window.windowCtrl.closeApp();
  // }
  
  // Opsiyonel: DevTools açıldığında uyarı ver
  // alert('Developer tools are not allowed in this application.');
}

/**
 * Güvenlik önlemlerini temizle (gerekirse)
 */
function cleanupSecurity() {
  if (window._securityCheckInterval) {
    clearInterval(window._securityCheckInterval);
    delete window._securityCheckInterval;
  }
}

module.exports = {
  initSecurity,
  cleanupSecurity
};
