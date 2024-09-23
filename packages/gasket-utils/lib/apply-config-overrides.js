const path = require('path');
const defaultsDeep = require('lodash.defaultsdeep');
const tryRequire = require('./try-require');
// @ts-ignore - diagnostics lib does not have a types declaration file
const debug = require('diagnostics')('gasket:utils');

/**
 * Normalize the config by applying any overrides for environments, commands,
 * or local-only config file.
 * @type {import('./index').applyConfigOverrides}
 */
function applyConfigOverrides(
  config,
  { env = '', commandId, root, localFile }
) {
  return defaultsDeep(
    {},
    ...getPotentialConfigs({ config, env, commandId, root, localFile })
  );
}

/**
 * Generator function to yield potential configurations
 * @type {import('./index').getPotentialConfigs}
 */
function *getPotentialConfigs({ config, env, commandId, root, localFile }) {
  // Separate environment-specific config from other config
  const { environments = {}, commands = {}, ...baseConfig } = config;
  const isLocalEnv = env === 'local';

  yield* getLocalOverrides(isLocalEnv, root, localFile);
  yield* getCommandOverrides(commands, commandId);
  yield* getSubEnvironmentOverrides(env, environments);
  yield* getDevOverrides(isLocalEnv, environments);
  yield baseConfig;
}

/**
 * Generator function to yield local overrides
 * @type {import('./internal').getLocalOverrides}
 */
function *getLocalOverrides(isLocalEnv, root, localFile) {
  // For git-ignorable changes, merge in optional `.local` file
  const localOverrides =
    isLocalEnv && localFile && tryRequire(path.join(root, localFile));
  if (localOverrides) {
    debug('Including local config file for overrides', localFile);
    yield localOverrides;
  }
}

/**
 * Generator function to yield command overrides
 * @type {import('./internal').getCommandOverrides}
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
 * @type {import('./internal').getSubEnvironmentOverrides}
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
 * @type {import('./internal').getDevOverrides}
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
