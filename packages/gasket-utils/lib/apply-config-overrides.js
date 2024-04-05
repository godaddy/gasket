const defaultsDeep = require('lodash.defaultsdeep');

const debug = require('diagnostics')('gasket:utils');

/**
 * Normalize the config by applying any overrides for environments, commands,
 * or local-only config file.
 *
 * @param {object} config - Target config to be normalized
 * @param {object} context - Context for applying overrides
 * @param {string} context.env - Name of environment
 * @param {string} [context.commandId] - Name of command
 * @returns {object} config
 */
function applyConfigOverrides(config, { env = '', commandId }) {
  return defaultsDeep(
    {},
    ...getPotentialConfigs({ config, env, commandId })
  );
}

function *getPotentialConfigs({ config, env, commandId }) {
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

function *getDevOverrides(isLocalEnv, environments) {
  // Special case for the local environment, which inherits from the
  // development environment
  const devEnv = isLocalEnv && (environments.development || environments.dev);
  if (devEnv) {
    debug('Including dev/development override due to local environment inheritance');
    yield devEnv;
  }
}

module.exports = applyConfigOverrides;
