const path = require('path');
const defaultsDeep = require('lodash.defaultsdeep');
const tryRequire = require('./try-require');

/**
 * Normalize the config by applying any environment or local overrides
 *
 * @param {object} gasketConfig - Gasket config
 * @param {object} config - Target config to be normalized
 * @param {string} [localFile] - Optional file to load relative to gasket root
 * @returns {object} config
 */
function applyEnvironmentOverrides(gasketConfig, config, localFile) {
  const { env, root } = gasketConfig;
  // Separate environment-specific config from other config
  const { environments = {}, ...baseConfig } = config;

  // Iterate over any `.` delimited parts (e.g. `production.subEnv`) and
  // merge any corresponding config within `environments` into the
  // configuration of this command.
  const envParts = env.split('.');
  let normalizedConfig = envParts.reduce((acc, part, i) => {
    return defaultsDeep({},
      environments[envParts.slice(0, i + 1).join('.')],
      acc);
  }, baseConfig);

  // Special case for the local environment, which inherits from the
  // development environment
  if (env === 'local') {
    const devConfig = environments.development || environments.dev;
    if (devConfig) {
      normalizedConfig = defaultsDeep({}, normalizedConfig, devConfig);
    }

    // For git-ignorable changes, merge in optional `.local` file
    if (localFile) {
      const localOverrides = tryRequire(path.join(root, localFile));
      if (localOverrides) {
        normalizedConfig = defaultsDeep({}, localOverrides, normalizedConfig);
      }
    }
  }

  return normalizedConfig;
}

module.exports = applyEnvironmentOverrides;
