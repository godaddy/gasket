const merge = require('deepmerge');

/**
 * Service worker defaults
 *
 * Cache is configured to keep content for 5 days since last request.
 * This is to keep the cache from growing out of hand without limiting the
 * number of items. We won't know the number of cache keys, but we do know
 * that plugins could change their key element based on services they may
 * tie into, so we will instead dispose stale content.
 */
const defaultConfig = {
  url: '/sw.js',
  scope: '/',
  content: '',
  cache: {
    maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
    updateAgeOnGet: true
  }
};

/**
 * Configure lifecycle to set up SW config with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} baseConfig - Base gasket config
 * @returns {Object} config
 */
module.exports = function configure(gasket, baseConfig = {}) {
  baseConfig.serviceWorker = merge(defaultConfig, baseConfig.serviceWorker || {});
  return baseConfig;
};
