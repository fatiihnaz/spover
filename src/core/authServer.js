const http = require('http');
const protocol = require('./protocol');

function start(port = 4350) {
  const server = http.createServer((req, res) => {
    if (!req.url.startsWith('/callback')) {
      res.writeHead(404).end();
      return;
    }

    const full = `http://127.0.0.1:${port}${req.url}`;
    protocol.handleOAuthCallback(full);        // token değişimi
    res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' });
    res.end(successPage());
  });

  // Socket timeout ve error handling ekle
  server.timeout = 10000; // 10 saniye timeout
  server.keepAliveTimeout = 5000; // 5 saniye keep-alive timeout
  server.headersTimeout = 6000; // 6 saniye headers timeout

  server.on('error', (err) => {
    console.error('[oauth] server error:', err);
  });

  server.on('clientError', (err, socket) => {
    console.warn('[oauth] client error:', err.message);
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });

  server.listen(port, '127.0.0.1', () =>
    console.log(`[oauth] callback server listening on ${port}`)
  );

  return { port, close: () => server.close() };
}

module.exports = { start };

/* ------------------------------------------------------------------ */
const successPage = () => 
`<!doctype html>
<meta charset="utf-8">
<title>Spotify Bağlandı</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{ --green:#1db954; }
*{box-sizing:border-box;margin:0;padding:0}
body{display:flex;justify-content:center;align-items:center;height:100vh;background:#121212;color:#c9d1d9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
.card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px 40px;box-shadow:0 8px 32px rgba(0,0,0,.45);text-align:center;backdrop-filter:blur(6px)}
.check{width:72px;height:72px;border-radius:50%;background:var(--green);display:flex;justify-content:center;align-items:center;margin:0 auto 24px}
.check svg{width:36px;height:36px;stroke-width:3;stroke:#fff;fill:none}
small{opacity:.7;display:block;margin-top:12px;font-size:.85rem}
@keyframes fadeOut{to{opacity:0;transform:scale(.96)}}
</style>
<div class="card" id="card">
  <div class="check">
    <svg viewBox="0 0 24 24"><polyline points="5 13 9 17 19 7"></polyline></svg>
  </div>
  <h1 style="font-size:1.3rem;margin-bottom:4px">Başarılı!</h1>
  <p style="font-size:.95rem">Spotify hesabınız bağlandı.</p>
  <small>(Pencere otomatik kapanacak)</small>
</div>
<script>
setTimeout(()=>{document.getElementById('card').style.animation='fadeOut .4s forwards'},1100);
setTimeout(()=>window.close(),1500);
</script>`;

module.exports = { start };