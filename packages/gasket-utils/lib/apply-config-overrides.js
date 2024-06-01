const defaultsDeep = require('lodash.defaultsdeep');
const debug = require('diagnostics')('gasket:utils');

/**
 * Normalize the config by applying any overrides for environments, commands,
 * or local-only config file.
 * @type {import('./index').applyConfigOverrides}
 */
function applyConfigOverrides(
  config,
  { env = '', commandId }
) {
  return defaultsDeep(
    {},
    ...getPotentialConfigs(config, { env, commandId })
  );
}

/**
 * Generator function to yield potential configurations
 * @type {import('./index').getPotentialConfigs}
 */
function *getPotentialConfigs(config, { env, commandId }) {
  // Separate environment-specific config from another config
  const { environments = {}, commands = {}, ...baseConfig } = config;
  const isLocalEnv = env === 'local';

  yield* getCommandOverrides(commands, commandId);
  yield* getSubEnvironmentOverrides(env, environments);
  yield* getDevOverrides(isLocalEnv, environments);
  yield baseConfig;
}

function *getCommandOverrides(commands, commandId) {
  const commandOverrides = commandId && commands[commandId];
  if (commandOverrides) {
    debug('Including config overrides for command', commandId);
    yield commandOverrides;
  }
}

/**
 * Generator function to yield sub-environment overrides
 * @param {string} env - Environment
 * @param {object} environments - Environments object
 * @yields {object} - Sub-environment overrides
 */
function *getSubEnvironmentOverrides(env, environments) {
  const envParts = env.split('.');

  // Iterate over any `.` delimited parts (e.g. `production.subEnv`) and
  // merge any corresponding configs within `environments`
  for (let i = envParts.length - 1; i >= 0; i--) {
    const name = envParts.slice(0, i + 1).join('.');
    const overrides = environments[name];
    if (overrides) {
      debug('Including sub-environment override', name);
      yield overrides;
    }
  }
}

/**
 * Generator function to yield development overrides
 * @param {boolean} isLocalEnv - Is the environment local
 * @param {object} environments - Environments object
 * @yields {object} - Development overrides
 */
function *getDevOverrides(isLocalEnv, environments) {
  // Special case for the local environment, which inherits from the
  // development environment
  const devEnv = isLocalEnv && (environments.development || environments.dev);
  if (devEnv) {
    debug(
      'Including dev/development override due to local environment inheritance'
    );
    yield devEnv;
  }
}

module.exports = applyConfigOverrides;
