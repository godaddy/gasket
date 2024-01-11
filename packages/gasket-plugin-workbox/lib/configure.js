const {
  getWorkboxConfig,
  getBasePath
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
  const basePath = getBasePath({ config });

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
