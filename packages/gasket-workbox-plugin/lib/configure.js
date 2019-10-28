const {
  getWorkboxConfig,
  getAssetPrefix
} = require('./utils');

/**
 * Configure lifecycle to set up SW config with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} config - Base gasket config
 * @returns {Promise<Object>} config
 */
module.exports = async function configure(gasket, config) {
  const workbox = getWorkboxConfig({ config });
  const assetPrefix = getAssetPrefix({ config });

  const { version } = require('workbox-build/package');
  const libraryVersion = `workbox-v${version}`;

  const scriptUrl = [
    ...(assetPrefix ? [assetPrefix] : []),
    '_workbox',
    libraryVersion,
    'workbox-sw.js'
  ].join('/');

  const { importScripts } = workbox.config;

  workbox.libraryVersion = libraryVersion;
  workbox.config.importScripts = [scriptUrl, ...importScripts];

  return ({ ...config, workbox });
};
