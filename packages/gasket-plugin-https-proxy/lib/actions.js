import proxy from 'http-proxy';

/**
 * Gasket action: prepareProxyServer
 * @param {import('@gasket/core').Gasket} gasket Gasket instance
 * @returns {Promise<void>} promise
 * @public
 */
export async function prepareProxyServer(gasket) {
  await gasket.isReady;
  await gasket.exec('preboot');
}

/** @type {import('@gasket/core').ActionHandler<'startProxyServer'>} */
export async function startProxyServer(gasket) {
  await gasket.actions.prepareProxyServer();
  const { httpsProxy } = gasket.config;
  const { logger } = gasket;

  const opts = await gasket.execWaterfall('httpsProxy', httpsProxy);

  const { protocol = 'http', hostname = 'localhost', port = 8080, ...proxyOpts } = opts;
  const server = proxy.createServer(
    proxyOpts
  ).on('error', (err) => {
    logger.error('Request failed to proxy:', err);
  }).listen(
    port
  );

  logger.info(`Proxy server started: ${protocol}://${hostname}:${port}`);
  return server;
}

export const actions = {
  prepareProxyServer,
  startProxyServer
};
