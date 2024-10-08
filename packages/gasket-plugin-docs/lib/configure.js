const defaultsDeep = require('lodash.defaultsdeep');
const { DEFAULT_CONFIG } = require('./utils/constants');

/**
 * Configure lifecycle to set up SW config with defaults
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
module.exports = function configure(gasket, baseConfig) {
  const userConfig = baseConfig?.docs || {};

  const docs = defaultsDeep({}, userConfig, DEFAULT_CONFIG);
  return { ...baseConfig, docs };
};
