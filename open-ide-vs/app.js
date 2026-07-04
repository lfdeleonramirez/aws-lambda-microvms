const http = require('http');

// Hook server en puerto 8081 - responde 200 a /ready y /run
const hookServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
});

hookServer.listen(8081, () => {
  console.log('Hook server listening on port 8081');
});

// App server en puerto 8080 - Hola Mundo
const appServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hola Mundo!\n');
});

appServer.listen(8080, () => {
  console.log('App server listening on port 8080');
});
