const merge = require('deepmerge');

/**
 * Docs defaults
 */
const defaultConfig = {
  generate: true,
  clean: true,
  dir: '.docs',
  docsify: {
    theme: 'vue',
    port: 3000,
    config: {
      auto2top: true
    }
  }
};

/**
 * Configure lifecycle to set up SW config with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} baseConfig - Base gasket config
 * @returns {Object} config
 */
module.exports = async function configureHook(gasket, baseConfig = {}) {
  const userConfig = baseConfig.docs || {};

  const docs = merge.all([defaultConfig, userConfig]);
  return ({ ...baseConfig, docs });
};
