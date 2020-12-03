const deepmerge = require('deepmerge');
const baseConfig = require('./base-config');
const { prepareStaticOutputPath } = require('./utils');

/**
 * Configure lifecycle to set up manifest with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} config - Base gasket config
 * @returns {Object} config
 */
module.exports = function configure(gasket, config = {}) {
  const { config: { root } } = gasket;
  const manifest = deepmerge(baseConfig, config.manifest);
  const { staticOutput = false } = manifest;

  manifest.staticOutput = prepareStaticOutputPath(staticOutput, root);

  return { ...config, manifest };
};
