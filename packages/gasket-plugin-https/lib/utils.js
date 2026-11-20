import nodeHttp, { ServerResponse } from 'node:http';
import nodeHttps from 'node:https';
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
 * @returns {nodeHttp.Server} The listening server
 */
function listen(proxy, { ssl, ws, port, logger }) {
  // A target that drops mid-response emits no proxy error, so close the client too.
  proxy.on('proxyRes', (proxyRes, req, res) => {
    proxyRes.on('close', () => {
      if (!proxyRes.complete) res.destroy();
    });
  });

  /** @type {nodeHttp.RequestListener} */
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
  const listener = ssl ? nodeHttps.createServer(ssl, onRequest) : nodeHttp.createServer(onRequest);
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
  return listener.listen(port);
}

/**
 * Provide port defaults
 * @param {string} env env property from gasket config
 * @returns {number} Default port number
 * @public
 */
function getPortFallback(env = '') {
  return /local/.test(env) ? 8080 : 80;
}

/**
 * Check if the supplied errors are a result of the port being in use.
 * @param {Array<object>} errors Errors received from create-servers
 * @returns {boolean} Indication if the port was in use.
 * @private
 */
function portInUseError(errors) {
  const error = Array.isArray(errors) ? errors[0] : errors;
  return (
    ((error.http2 || error.https || error.http || {}).code || '') ===
    'EADDRINUSE'
  );
}

/**
 * Create a https proxy server for local development
 * @type {import('./index.d.ts').startProxy}
 */
function startProxy(opts, logger) {
  const { protocol = 'http', hostname = 'localhost', port = 8080, ssl, ...proxyOpts } = opts;
  // The documented 2-minute default, which http-proxy-3 does not apply; without it a silent target holds the client open.
  proxyOpts.proxyTimeout ??= 120000;
  if (proxyOpts.target) proxyOpts.target = withPathname(proxyOpts.target);
  if (proxyOpts.forward) proxyOpts.forward = withPathname(proxyOpts.forward);
  // Object targets may use the http-proxy shape; http-proxy-3 coerces `port` and withPathname maps `path`.
  const proxy = createServer(/** @type {import('http-proxy-3').ServerOptions} */ (proxyOpts)).on('error', (e, req, res) => {
    logger.error('Request failed to proxy:', e);
    // Answer the client so a failing target does not leave its connection open.
    if (res instanceof ServerResponse && !res.headersSent) {
      res.writeHead(502, { 'content-type': 'text/plain' });
      res.end('Bad Gateway');
    } else {
      res?.destroy();
    }
  });
  const server = listen(proxy, { ssl, ws: proxyOpts.ws, port, logger });

  logger.info(`Proxy server started: ${protocol}://${hostname}:${port}`);
  return server;
}

/**
 * Get server options from the gasket config
 * @param {import('@gasket/core').Gasket} gasket Gasket instance
 * @returns {import('@gasket/core').ServerOptions} config
 */
function getRawServerConfig(gasket) {
  const { hostname, http2, https, http, root } = gasket.config;
  const rawConfig = {};
  rawConfig.hostname = hostname;
  rawConfig.root = root;
  if (http) rawConfig.http = http;
  if (https) rawConfig.https = https;
  if (http2) rawConfig.http2 = http2;
  return rawConfig;
}

export {
  getPortFallback,
  portInUseError,
  startProxy,
  getRawServerConfig
};
