const deepmerge = require('deepmerge');
// @ts-ignore - diagnostics lib does not have a types declaration file
const debug = require('diagnostics')('gasket:utils');
// @ts-ignore - 'isPlainObject' is not imported by using a default import
const { isPlainObject } = require('is-plain-object');

/**
 * Normalize the config by applying any overrides for environments, commands,
 * or local-only config file.
 * @type {import('./config').applyConfigOverrides}
 */
function applyConfigOverrides(config, { env = '', commandId }) {
  // @ts-ignore - merged config definitions
  return deepmerge.all(
    // @ts-ignore - partial config definitions
    [...getPotentialConfigs(config, { env, commandId })].reverse(),
    { isMergeableObject: isPlainObject }
  );
}

/**
 * Generator function to yield potential configurations
 * @type {import('./config').getPotentialConfigs}
 */
function *getPotentialConfigs(config, { env, commandId }) {
  // Separate environment-specific config from another config
  const { environments = {}, commands = {}, ...baseConfig } = config;
  const isLocalEnv = env === 'local';

  // Keep commands unless a command id is passed
  if (commandId) {
    yield* getCommandOverrides(commands, commandId);
  } else {
    baseConfig.commands = commands;
  }
  yield* getSubEnvironmentOverrides(env, environments);
  yield* getDevOverrides(isLocalEnv, environments);
  yield baseConfig;
}

/**
 * Generator function to yield command overrides
 * @type {import('./config').getCommandOverrides}
 */
function *getCommandOverrides(commands, commandId) {
  const commandOverrides = commandId && commands[commandId];
  if (commandOverrides) {
    debug('Including config overrides for command', commandId);
    yield commandOverrides;
  }
}

/**
 * Generator function to yield sub-environment overrides
 * @type {import('./config').getSubEnvironmentOverrides}
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
 * @type {import('./config').getDevOverrides}
 */
function *getDevOverrides(isLocalEnv, environments) {
  // Special case for the local environment, which inherits from the
  // development environment
  const devEnv = isLocalEnv && (environments.development || environments.dev);
  if (devEnv) {
    debug('Including dev/development override due to local environment inheritance');
    yield devEnv;
  }
}

module.exports = {
  applyConfigOverrides
};
