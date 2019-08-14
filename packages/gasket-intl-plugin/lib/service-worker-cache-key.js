const { createGetLanguage } = require('./utils');

/**
 * Register a cache key function to get the language from req
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Promise<(getLanguage)>} result
 */
module.exports = async function serviceWorkerCacheKey(gasket) {
  return createGetLanguage(gasket);
};
