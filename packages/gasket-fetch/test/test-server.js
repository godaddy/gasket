import http from 'http';

export const createServer = () => {
  return http.createServer((req, res) => {
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));
    req.on('end',  () => {
      res.writeHead(200, {
        'content-type': 'application/json',
        'cache-control': 'max-age=0, no-cache, no-store',
        'access-control-allow-origin': '*'
      });

      res.end(JSON.stringify({ echo: JSON.parse(chunks.join()) }));
    });
  });
};

export const closeServer = (server) => {
  server.close();
};
