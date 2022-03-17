const applyConfigOverrides = require('./apply-config-overrides');

/**
 * Normalize the config by applying any environment or local overrides
 *
 * @param {object} gasketConfig - Gasket config
 * @param {object} config - Target config to be normalized
 * @param {string} [localFile] - Optional file to load relative to gasket root
 * @returns {object} config
 * @deprecated use applyConfigOverrides
 */
function applyEnvironmentOverrides(gasketConfig, config, localFile) {
  const { env = '', root } = gasketConfig;
  return applyConfigOverrides(config, { env, root, localFile });
}

module.exports = applyEnvironmentOverrides;
