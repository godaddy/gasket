/* eslint-disable no-console, no-process-env */

import GasketEngine from './engine.js';
import { applyConfigOverrides } from '@gasket/utils';

/**
 * Get the environment to use for the gasket instance.
 * Defaults to `local`.
 * @returns {string} env
 */
function getEnvironment() {
  const { GASKET_ENV } = process.env;
  if (GASKET_ENV) {
    return GASKET_ENV;
  }

  console.warn(`No GASKET_ENV env variable set; defaulting to "local".`);
  return 'local';
}
/* eslint-enable no-console, no-process-env */

// TODO: Add JSDoc types
/**
 *
 * @param instance
 */
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

    // prune nullish and/or empty plugins
    config.plugins = config.plugins
      .filter(Boolean)
      .filter(plugin => Boolean(plugin.name) || Boolean(plugin.hooks));

    // start the engine
    super(config.plugins);

    this.config = config;
    this.command = null;
    this.execSync('init');
    this.actions = registerActions(this);
    this.config = this.execWaterfallSync('configure', config);
  }
}

// TODO: Add JSDoc types
/**
 *
 * @param gasketConfigDefinition
 */
function makeGasket(gasketConfigDefinition) {
  return new Gasket(gasketConfigDefinition);
}

export {
  makeGasket,
  GasketEngine
};
