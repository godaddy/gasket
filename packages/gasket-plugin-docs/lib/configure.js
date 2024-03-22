/// <reference types="@gasket/plugin-command" />
const defaultsDeep = require('lodash.defaultsdeep');

const defaultConfig = {
  outputDir: '.docs'
};

/**
 * Configure lifecycle to set up SW config with defaults
 * @type {import('@gasket/engine').HookHandler<'configure'>}
 */
module.exports = function configureHook(gasket, baseConfig = {}) {
  const userConfig = baseConfig.docs || {};

  const docs = defaultsDeep({}, userConfig, defaultConfig);
  return ({ ...baseConfig, docs });
};


module.exports.defaultConfig = defaultConfig;
