const path = require('path');
const merge = require('deepmerge');

/**
 * Workbox defaults
 *
 * @type {Object}
 */
const defaultConfig = {
  outputDir: './build/workbox',
  config: {
    skipWaiting: true,
    importScripts: []
  }
};

/**
 * Get the workbox config from gasket.config with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Object} config
 */
function getWorkboxConfig(gasket) {
  const { workbox: workboxConfig = {} } = gasket.config;
  return merge(defaultConfig, workboxConfig);
}

/**
 * Get the build output dir from project root and configured outputDir
 *
 * @param {Gasket} gasket - Gasket
 * @returns {string} path
 */
function getOutputDir(gasket) {
  const { root } = gasket.config;
  const { outputDir } = getWorkboxConfig(gasket);
  return path.join(root, outputDir);
}

/**
 * Get the asset prefix from either next or workbox config.
 * If found in both, the workbox config will be used.
 *
 * @param {Gasket} gasket - Gasket
 * @returns {string} prefix
 */
function getAssetPrefix(gasket) {
  const { zone = '', workbox = {} } = gasket.config;
  let assetPrefix = zone;
  if ('assetPrefix' in workbox) {
    assetPrefix = workbox.assetPrefix;
  }
  return assetPrefix;
}

module.exports = {
  defaultConfig,
  getWorkboxConfig,
  getOutputDir,
  getAssetPrefix
};
