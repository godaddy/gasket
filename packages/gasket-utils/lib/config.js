import deepmerge from 'deepmerge';
import diagnostics from 'diagnostics';
import { isPlainObject } from 'is-plain-object';

const debug = diagnostics('gasket:utils');

/**
 * Normalize the config by applying any overrides for environments, commands,
 * or local-only config file.
 * @type {import('./index.js').applyConfigOverrides}
 */
function applyConfigOverrides(config, { env = '', commandId }) {
  const potentialConfigs = [...getPotentialConfigs(config, { env, commandId })].reverse();

  // Cast to 'any' because generic type 'T' is only available in TypeScript declarations
  return /** @type {any} */ (deepmerge.all(potentialConfigs, { isMergeableObject: isPlainObject }));
}

/**
 * Generator function to yield potential configurations
 * @type {import('./index.js').getPotentialConfigs}
 */
function *getPotentialConfigs(config, { env, commandId }) {
  // Separate environment-specific config from another config
  const { environments = {}, commands = {}, ...baseConfig } = config;
  const isLocalEnv = env === 'local';

  // Keep commands unless a command id is passed
  if (commandId) {
    yield* getCommandOverrides(commands, commandId);
  } else {
    // Cast baseConfig to any to manually add back commands property
    /** @type {any} */ (baseConfig).commands = commands;
  }
  yield* getSubEnvironmentOverrides(env, environments);
  yield* getDevOverrides(isLocalEnv, environments);
  yield baseConfig;
}

/**
 * Generator function to yield command overrides
 * @type {import('./index.js').getCommandOverrides}
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
 * @type {import('./index.js').getSubEnvironmentOverrides}
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
 * @type {import('./index.js').getDevOverrides}
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

export {
  applyConfigOverrides
};
