const defaultsDeep = require('lodash.defaultsdeep');
const path = require('path');
const { applyConfigOverrides } = require('@gasket/utils');

/**
 * Loads the root ./app.config.js if it exists and applies env overrides.
 * This will be merged with any config loaded from ./gasket-data dir.
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} appConfig - Initial app config
 * @returns {Object} config
 */
module.exports = function mergeRootConfig(gasket, appConfig = {}) {
  const { command: { id: commandId }, config: { env, root } } = gasket;
  let config;

  try {
    config = require(path.join(gasket.config.root, './gasket-data.config'));
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
  }

  if (config) {
    return applyConfigOverrides(
      defaultsDeep({}, appConfig, config),
      { env, commandId, root, localFile: './gasket-data.config.local' }
    );
  }

  return appConfig;
};
