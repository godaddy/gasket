const defaultsDeep = require('lodash.defaultsdeep');

const defaultConfig = {
  outputDir: '.docs'
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

  const docs = defaultsDeep({}, userConfig, defaultConfig);
  return ({ ...baseConfig, docs });
};
