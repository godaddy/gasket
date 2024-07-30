const path = require('path');
const merge = require('deepmerge');

const isDefined = o => typeof o !== 'undefined';

/**
 * Workbox defaults
 * @type {object}
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
 * @param {Gasket} gasket - Gasket
 * @returns {object} config
 */
function getWorkboxConfig(gasket) {
  const { workbox: workboxConfig = {} } = gasket.config;
  return merge(defaultConfig, workboxConfig);
}

/**
 * Get the build output dir from project root and configured outputDir
 * @param {Gasket} gasket - Gasket
 * @returns {string} path
 */
function getOutputDir(gasket) {
  const { root } = gasket.config;
  const { outputDir } = getWorkboxConfig(gasket);
  return path.join(root, outputDir);
}

/**
 * Get the base path from workbox, or root basePath config.
 * If found in both, the workbox config will be used.
 * @param {Gasket} gasket - Gasket
 * @returns {string} prefix
 */
function getBasePath(gasket) {
  const { workbox = {}, basePath: rootBasePath } = gasket.config;
  const { basePath } = workbox;

  return [basePath, rootBasePath, ''].find(isDefined);
}

module.exports = {
  defaultConfig,
  getWorkboxConfig,
  getOutputDir,
  getBasePath
};
