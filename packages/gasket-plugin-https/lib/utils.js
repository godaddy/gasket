import proxy from 'http-proxy';

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
  const { protocol = 'http', hostname = 'localhost', port = 8080, ...proxyOpts } = opts;
  proxy.createServer(
    proxyOpts
  ).on('error', (e) => {
    logger.error('Request failed to proxy:', e);
  }).listen(
    port
  );

  logger.info(`Proxy server started: ${protocol}://${hostname}:${port}`);
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
