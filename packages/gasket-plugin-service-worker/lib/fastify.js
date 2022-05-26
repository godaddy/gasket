const LRU = require('lru-cache');
const { getCacheKeys, getComposedContent, getSWConfig } = require('./utils');

/**
 * Configures the endpoint with the gasket config
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Function} endpoint
 */
async function configureEndpoint(gasket) {
  const { logger } = gasket;
  const { cache: cacheConfig = {} } = getSWConfig(gasket);

  const cache = new LRU(cacheConfig);
  const cacheKeys = await getCacheKeys(gasket);

  return async function sw(req, res) {
    const cacheKey = cacheKeys.reduce((acc, fn) => acc + fn(req, res), '_');

    let composedContent = cache.get(cacheKey);
    if (!composedContent) {
      logger.info(`Composing service worker for key: ${cacheKey}`);

      composedContent = await getComposedContent(gasket, { req, res });

      cache.set(cacheKey, composedContent);
    }

    res.set('Content-Type', 'application/javascript');
    res.send(composedContent);
  };
}

/**
 * Express lifecycle to add an endpoint to serve service worker script
 *
 * @param {Gasket} gasket - Gasket
 * @param {Fastify} app - App
 */
module.exports = async function fastify(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);
  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
