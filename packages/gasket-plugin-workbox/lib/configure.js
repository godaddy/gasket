const util = require('util');
const fs = require('fs');
const {
  getWorkboxConfig,
  getOutputDir,
  getAssetPrefix
} = require('./utils');

const readDir = util.promisify(fs.readdir);

/**
 * Configure lifecycle to set up SW config with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} config - Base gasket config
 * @returns {Promise<Object>} config
 */
module.exports = async function configure(gasket, config) {
  const workbox = getWorkboxConfig({ config });
  const outputDir = getOutputDir({ config });
  const assetPrefix = getAssetPrefix({ config });

  const items = await readDir(outputDir);
  const libraryVersion = items.find(p => p.startsWith('workbox-')).trim();

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
