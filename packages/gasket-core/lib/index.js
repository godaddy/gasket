/* eslint-disable no-console, no-process-env */
// @ts-check
/// <reference types="./index" />

import GasketEngine from '@gasket/engine';
import { applyConfigOverrides } from '@gasket/utils';

/**
 * Get the environment to use for the gasket instance.
 * Defaults to `development`.
 * @returns {string} env
 */
function getEnvironment(
  // flags, commandId, warn
) {
  // TODO: enable if cli commands and flags are to be used with v7
  // if (flags.env) {
  //   debug('Environment was passed through command line flags', flags.env);
  //   return flags.env;
  // }

  const { GASKET_ENV } = process.env;
  if (GASKET_ENV) {
    return GASKET_ENV;
  }

  // TODO: enable if cli commands and flags are to be used with v7
  // // special snowflake case to match up `local` env with command unless set
  // if (commandId === 'local') {
  //   debug('Environment defaulting to `local` due to `local` command');
  //   return 'local';
  // }

  const { NODE_ENV } = process.env;
  if (NODE_ENV) {
    console.warn(`No env specified, falling back to NODE_ENV: "${NODE_ENV}".`);
    return NODE_ENV;
  }

  console.warn('No env specified, falling back to "development".');
  return 'development';
}
/* eslint-enable no-console, no-process-env */


function registerActions(instance) {
  const actions = {};
  const actionPluginMap = {};

  instance.execApplySync('actions', async (plugin, handler) => {
    const results = handler(); // The gasket parameter is automatically applied
    if (results) {
      Object.keys(results).forEach(actionName => {
        if (actionPluginMap[actionName]) {
          // eslint-disable-next-line no-console
          console.error(
            `Action '${actionName}' from '${plugin.name}' was registered by '${actionPluginMap[actionName]}'`
          );
          return;
        }
        actionPluginMap[actionName] = plugin.name;
        actions[actionName] = results[actionName];
      });
    }
  });

  return actions;
}

// TODO: Add JSDoc types
class Gasket extends GasketEngine {
  constructor(gasketConfig) {
    const env = getEnvironment();
    const config = applyConfigOverrides(gasketConfig, { env });
    config.env = env;
    config.root ??= process.cwd();

    super(config.plugins);
    this.command = null;
    this.config = this.execWaterfallSync('configure', config);
    this.actions = registerActions(this);
  }
}

export function makeGasket(gasketConfigDefinition) {
  return new Gasket(gasketConfigDefinition);
}
