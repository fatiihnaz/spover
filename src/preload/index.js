const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settings', {
  get: () => ipcRenderer.invoke('settings:get'),
  set: (d) => ipcRenderer.send('settings:set', d),
  onChange: (cb) => {
    const handler = (_e, d) => cb(d);
    ipcRenderer.on('settings:changed', handler);
    return () => ipcRenderer.removeListener('settings:changed', handler);
  },
});

contextBridge.exposeInMainWorld('shortcuts', {
  get: () => ipcRenderer.invoke('shortcuts:get'),
  set: (map) => ipcRenderer.send('shortcuts:set', map),
  pause: () => ipcRenderer.invoke('shortcuts:pause'),
  resume: () => ipcRenderer.invoke('shortcuts:resume'),
  reset: () => ipcRenderer.invoke('settings:reset-shortcuts'),
  onChange: (cb) => {
    const handler = (_e, d) => cb(d);
    ipcRenderer.on('shortcuts:changed', handler);
    return () => ipcRenderer.removeListener('shortcuts:changed', handler);
  },
  onError: (cb) => {
    const handler = (_e, d) => cb(d);
    ipcRenderer.on('shortcuts:error', handler);
    return () => ipcRenderer.removeListener('shortcuts:error', handler);
  },
});

contextBridge.exposeInMainWorld('credentials', {
  get: () => ipcRenderer.invoke('credentials:get'),
  set: d => ipcRenderer.send('credentials:set', d),
  onChange: cb => ipcRenderer.on('credentials:changed', (_e, d) => cb(d)),
});

contextBridge.exposeInMainWorld('spotify', {
  login: () => ipcRenderer.invoke('spotify:login'),
  onNow: (cb) => {
    const handler = (_e, d) => cb(d);
    ipcRenderer.on('spotify:now', handler);
    return () => ipcRenderer.removeListener('spotify:now', handler);
  },
  prev: () => ipcRenderer.invoke('spotify:prev'),
  next: () => ipcRenderer.invoke('spotify:next'),
  togglePlay: () => ipcRenderer.invoke('spotify:togglePlay'),
  setVolume: (v) => ipcRenderer.invoke('spotify:setVolume', v),
  isConnected: () => ipcRenderer.invoke('spotify:status'),
  onDisconnected: cb => ipcRenderer.on('spotify:disconnected', (_e) => cb()),
  onConnected: (cb) => ipcRenderer.on('spotify:connected', cb),
  getAudioFeatures: id => ipcRenderer.invoke('spotify:audioFeatures', id),
  getArtist: id => ipcRenderer.invoke('spotify:artist', id),
  getQueue: () => ipcRenderer.invoke('spotify:queue'),
  getPlaylist: id => ipcRenderer.invoke('spotify:playlist', id),
});

contextBridge.exposeInMainWorld('windowCtrl', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  closePrompt: () => ipcRenderer.invoke('window:closePrompt'),
  closeApp: () => ipcRenderer.invoke('window:closeApp'),
  hideMain: () => ipcRenderer.invoke('window:hideMain'),
});

contextBridge.exposeInMainWorld('overlayControl', {
  onCycleMode(cb) {
    const handler = (_e) => cb();
    ipcRenderer.on('overlay:cycle-mode', handler);
    return () => ipcRenderer.removeListener('overlay:cycle-mode', handler);
  },
  onEnterDrag(cb) {
    const h = (_e) => cb();
    ipcRenderer.on('overlay:enter-drag', h);
    return () => ipcRenderer.removeListener('overlay:enter-drag', h);
  },
  onEnterCtrl(cb) {
    const h = (_e) => cb();
    ipcRenderer.on('overlay:enter-control', h);
    return () => ipcRenderer.removeListener('overlay:enter-control', h);
  },
  exitDrag: () => ipcRenderer.send('overlay:exit-drag'),
  exitCtrl: () => ipcRenderer.send('overlay:exit-control'),
  setControlRegion: (rect) => ipcRenderer.send('overlay:set-control-region', rect),
});



