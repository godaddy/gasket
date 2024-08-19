/* eslint-disable no-console, no-process-env */

import { GasketEngine, lifecycleMethods } from './engine.js';
import { applyConfigOverrides } from '@gasket/utils';
import { makeBranch } from './branch.js';

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
export class Gasket {

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
    this.engine = new GasketEngine(config.plugins);

    // bind engine methods to run through a proxy
    lifecycleMethods.forEach(method => {
      this[method] = (...args) => {
        return this.branch()[method](...args);
      };
    });

    this.hook = this.engine.hook.bind(this.engine);
    // allow branches to reach back to the root
    this.root = () => this;

    this.config = config;
    this.command = null;

    // @ts-ignore
    this.execSync('init');
    // @ts-ignore
    this.config = this.execWaterfallSync('configure', config);
    // @ts-ignore
    this.exec('ready');
  }

  branch() {
    return makeBranch(this);
  }

  get actions() {
    return this.branch().actions;
  }
}

// TODO: Add JSDoc types
/**
 *
 * @param gasketConfigDefinition
 */
export function makeGasket(gasketConfigDefinition) {
  return new Gasket(gasketConfigDefinition);
}
