import LRU from 'lru-cache';
import { getCacheKeys, getComposedContent, getSWConfig } from './utils.js';

/**
 * Configures the endpoint with the gasket config
 * @type {import('../index.d.ts').configureEndpoint}
 */
export default async function configureEndpoint(gasket) {
  const { logger } = gasket;
  const { cache: cacheConfig = {} } = getSWConfig(gasket);

  const cache = new LRU(cacheConfig);
  const cacheKeys = await getCacheKeys(gasket);

  return async function sw(req, res) {
    const cacheParts = await Promise.all(cacheKeys.map((fn) => fn(req, res)));
    const cacheKey = cacheParts.join('_');

    let composedContent = cache.get(cacheKey);
    if (!composedContent) {
      logger.info(`Composing service worker for key: ${cacheKey}`);

      composedContent = await getComposedContent(gasket, { req, res });

      cache.set(cacheKey, composedContent);
    }

    res.type('application/javascript');
    res.send(composedContent);
  };
};
