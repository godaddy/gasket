const path = require('path');
const defaultsDeep = require('lodash.defaultsdeep');
const tryRequire = require('./try-require');

/**
 * Normalize the config by applying any overrides for environments, commands,
 * or local-only config file.
 *
 * @param {object} config - Target config to be normalized
 * @param {object} context - Context for applying overrides
 * @param {string} context.env - Name of environment
 * @param {string} [context.commandId] - Name of command
 * @param {string} [context.root] - Project root; required if using localeFile
 * @param {string} [context.localFile] - Optional file to load relative to gasket root
 * @returns {object} config
 */
function applyEnvironmentOverrides(config, { env = '', commandId, root, localFile }) {
  // Separate environment-specific config from other config
  const { environments = {}, commands = {}, ...baseConfig } = config;
  const isLocalEnv = env === 'local';
  const envParts = env.split('.');

  const configs = [

    // For git-ignorable changes, merge in optional `.local` file
    isLocalEnv && localFile && tryRequire(path.join(root, localFile)),

    commandId && commands[commandId],

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
