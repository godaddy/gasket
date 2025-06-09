import proxy from 'http-proxy';

/** @type {import('@gasket/core').ActionHandler<'startProxyServer'>} */
export async function startProxyServer(gasket) {
  await gasket.isReady;
  await gasket.exec('prebootHttpsProxy');
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
  startProxyServer
};
