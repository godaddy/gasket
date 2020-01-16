const defaultsDeep = require('lodash.defaultsdeep');

const defaultConfig = {
  outputDir: '.docs'
};

/**
 * Configure lifecycle to set up SW config with defaults
 *
 * @param {Gasket} gasket - Gasket
 * @param {object} baseConfig - Base gasket config
 * @returns {object} config
 */
module.exports = function configureHook(gasket, baseConfig = {}) {
  const userConfig = baseConfig.docs || {};

  const docs = defaultsDeep({}, userConfig, defaultConfig);
  return ({ ...baseConfig, docs });
};


module.exports.defaultConfig = defaultConfig;
