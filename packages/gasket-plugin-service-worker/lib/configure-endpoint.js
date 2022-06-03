const LRU = require('lru-cache');
const { getCacheKeys, getComposedContent, getSWConfig } = require('./utils');

/**
 * Configures the endpoint with the gasket config
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Function} endpoint
 */
module.exports = async function configureEndpoint(gasket) {
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
};
