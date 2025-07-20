require('esbuild').build({
  entryPoints: ['src/bootstrap.js'],
  bundle: true,
  platform: 'node',       // node ortamı
  target: 'node16',       // Electron’un Node versiyonuna göre ayarlayın
  format: 'cjs',          // CommonJS çıkışı
  external: ['electron'], // 'electron' modülünü paket dışı bırak
  sourcemap: true,        // isteğe bağlı: hata ayıklama haritaları
  outfile: 'build/main.js',
}).catch(() => process.exit(1));
