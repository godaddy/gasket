const {
  getWorkboxConfig,
  getBasePath
} = require('./utils');

/**
 * Configure lifecycle to set up SW config with defaults
 * @param {Gasket} gasket - Gasket
 * @param {object} config - Base gasket config
 * @returns {Promise<object>} config
 */
module.exports = async function configure(gasket, config) {
  const { logger } = gasket;
  const workbox = getWorkboxConfig({ config });
  const basePath = getBasePath({ config });

  if ('assetPrefix' in workbox) logger.warning('DEPRECATED workbox config `assetPrefix` - use `basePath`');
  workbox.basePath = basePath;

  const { version } = require('workbox-build/package');
  const libraryVersion = `workbox-v${version}`;

  const scriptUrl = [
    ...(basePath ? [basePath] : []),
    '_workbox',
    libraryVersion,
    'workbox-sw.js'
  ].join('/');

  const { importScripts } = workbox.config;

  workbox.libraryVersion = libraryVersion;
  workbox.config.importScripts = [scriptUrl, ...importScripts];

  return ({ ...config, workbox });
};
