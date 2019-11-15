/**
 * Gathers thunks to key caches of composed sw scripts, based on req
 *
 * @param {Gasket} gasket - Gasket
 * @returns {function[]} cacheKeys
 * @async
 */
async function getCacheKeys(gasket) {
  const { exec, config } = gasket;
  const {
    cacheKeys: userCacheKeys = []
  } = config.serviceWorker || {};

  const pluginCacheKeys = await exec('serviceWorkerCacheKey');

  return [...userCacheKeys, ...pluginCacheKeys]
    .filter(k => typeof k === 'function');
}

module.exports = {
  getCacheKeys
};
