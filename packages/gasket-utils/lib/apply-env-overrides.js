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
  const isLocalEnv = env === 'local';
  const envParts = env.split('.');

  const configs = [

    // For git-ignorable changes, merge in optional `.local` file
    isLocalEnv && localFile && tryRequire(path.join(root, localFile)),

    // Iterate over any `.` delimited parts (e.g. `production.subEnv`) and
    // merge any corresponding configs within `environments`
    ...envParts
      .map((_, i) => environments[envParts.slice(0, i + 1).join('.')])
      .reverse(),

    // Special case for the local environment, which inherits from the
    // development environment
    isLocalEnv && (environments.development || environments.dev),

    baseConfig

  ].filter(Boolean);

  return defaultsDeep({}, ...configs);
}

module.exports = applyEnvironmentOverrides;
