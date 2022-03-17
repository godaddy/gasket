const defaultsDeep = require('lodash.defaultsdeep');
const path = require('path');
const { tryRequire, applyEnvironmentOverrides } = require('@gasket/utils');

/**
 * Loads the root ./app.config.js if it exists and applies env overrides.
 * This will be merged with any config loaded from ./config dir.
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} appConfig - Initial app config
 * @returns {Object} config
 */
module.exports = function mergeRootConfig(gasket, appConfig = {}) {
  const { command: { id: commandId }, config: { env, root } } = gasket;
  const config = tryRequire(path.join(gasket.config.root, './app.config'));
  if (config) {
    return applyEnvironmentOverrides(
      defaultsDeep({}, appConfig, config),
      { env, commandId, root, localFile: './app.config.local' }
    );
  }

  return appConfig;
};
