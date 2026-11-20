import http from 'node:http';
import https from 'node:https';
import { createServer } from 'http-proxy-3';

/**
 * http-proxy-3 reads `pathname` and `search` from object targets, so map the `path` that http-proxy read.
 * A `path` wins over any `pathname`/`search` on the same object, as it did with http-proxy.
 * @param {any} target - target or forward option
 * @returns {any} target with `pathname` and `search` set from `path`
 */
function withPathname(target) {
  if (!target || typeof target !== 'object' || target instanceof URL || typeof target.path !== 'string') return target;
  const { path, ...rest } = target;
  const queryAt = path.indexOf('?');
  if (queryAt === -1) return { ...rest, pathname: path, search: '' };
  return { ...rest, pathname: path.slice(0, queryAt), search: path.slice(queryAt) };
}

/**
 * Serve the proxy on a node http(s) server.
 * http-proxy-3 would serve HTTP/2 over TLS, and its passes can throw synchronously on a
 * malformed request URL, which would crash the process.
 * @param {import('http-proxy-3').ProxyServer} proxy - Proxy to serve
 * @param {{ ssl?: object, ws?: boolean, port: number, logger: { error: Function } }} options - Listener options
 */
function listen(proxy, { ssl, ws, port, logger }) {
  // A target that drops mid-response emits no proxy error, so close the client too.
  proxy.on('proxyRes', (proxyRes, req, res) => {
    proxyRes.on('close', () => {
      if (!proxyRes.complete) res.destroy();
    });
  });

  /** @type {http.RequestListener} */
  const onRequest = (req, res) => {
    try {
      proxy.web(req, res);
    } catch (err) {
      logger.error('Request failed to proxy:', err);
      if (res.headersSent) return void res.destroy();
      res.writeHead(400, { 'content-type': 'text/plain' });
      res.end('Bad Request');
    }
  };
  const listener = ssl ? https.createServer(ssl, onRequest) : http.createServer(onRequest);
  if (ws) {
    listener.on('upgrade', (req, socket, head) => {
      try {
        proxy.ws(req, socket, head);
      } catch (err) {
        logger.error('Request failed to proxy:', err);
        socket.destroy();
      }
    });
  }
  listener.on('error', (err) => {
    logger.error('Proxy server failed:', err);
  });
  listener.listen(port);

  proxy.address = () => listener.address();
  proxy.close = (cb) => {
    listener.close((err) => cb?.(err));
  };
}

/** @type {import('@gasket/core').ActionHandler<'startProxyServer'>} */
export async function startProxyServer(gasket) {
  await gasket.isReady;
  await gasket.exec('prebootHttpsProxy');
  const { httpsProxy } = gasket.config;
  const { logger } = gasket;

  const opts = await gasket.execWaterfall('httpsProxy', httpsProxy);

  const { protocol = 'http', hostname = 'localhost', port = 8080, ssl, ...proxyOpts } = opts;
  if (proxyOpts.target) proxyOpts.target = withPathname(proxyOpts.target);
  if (proxyOpts.forward) proxyOpts.forward = withPathname(proxyOpts.forward);

  const proxy = createServer(proxyOpts).on('error', (err) => {
    logger.error('Request failed to proxy:', err);
  });
  listen(proxy, { ssl, ws: proxyOpts.ws, port, logger });

  logger.info(`Proxy server started: ${protocol}://${hostname}:${port}`);
  return proxy;
}

export const actions = {
  startProxyServer
};
