const { defaultsDeep } = require('lodash');
const path = require('path');
const { tryRequire, applyEnvironmentOverrides } = require('@gasket/utils');

/**
 * Loads the root ./app.config.js if it exists and and applies env overrides.
 * This will be merged with any config loaded from ./config dir.
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} appConfig - Initial app config
 * @returns {Object} config
 */
module.exports = function mergeRootConfig(gasket, appConfig = {}) {
  const config = tryRequire(path.join(gasket.config.root, './app.config'));
  if (config) {
    return applyEnvironmentOverrides(
      gasket.config,
      defaultsDeep({}, appConfig, config),
      './app.config.local'
    );
  }

  return appConfig;
};
