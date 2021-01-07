const deepmerge = require('deepmerge');
const path = require('path');

const baseConfig = require('./base-config');

/**
 * Configure lifecycle to set up manifest with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} config - Base gasket config
 * @returns {Object} config
 */
module.exports = function configure(gasket, config = {}) {
  const { config: { root } } = gasket;
  const manifest = deepmerge(baseConfig, config.manifest || {});
  let { staticOutput } = manifest;

  // Fixup staticOutput - use default if true
  if (staticOutput === true) {
    staticOutput = 'public/manifest.json';
  }

  if (staticOutput) {
    staticOutput = path.join(root, staticOutput);
    manifest.staticOutput = staticOutput;
  }

  return { ...config, manifest };
};
