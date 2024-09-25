/* eslint-disable no-console, no-process-env */

import { GasketEngine, lifecycleMethods } from './engine.js';
import { applyConfigOverrides } from '@gasket/utils';
import { makeTraceBranch } from './trace.js';

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

/**
 * The Gasket class is the main entry point for the Gasket API.
 */
export class Gasket {

  /**
   * @param {import('@gasket/core').GasketConfigDefinition} configDef - Gasket configuration
   */
  constructor(configDef) {
    const env = getEnvironment();
    const config = applyConfigOverrides(configDef, { env });
    config.env = env;
    config.root ??= process.cwd();

    // prune nullish and/or empty plugins
    config.plugins = config.plugins
      .filter(Boolean)
      .map(plugin => plugin.default || plugin) // quality of life for cjs apps
      .filter(plugin => Boolean(plugin.name) || Boolean(plugin.hooks));

    // start the engine
    this.engine = new GasketEngine(config.plugins);

    // bind engine methods to run through a proxy
    lifecycleMethods.forEach(method => {
      this[method] = (...args) => {
        return this.traceBranch()[method](...args);
      };
    });

    this.hook = this.engine.hook.bind(this.engine);
    this.config = config;
    this.command = null;

    // Can be used as a key to identify a gasket instance
    this.symbol = Symbol('gasket');

    // @ts-ignore
    this.execSync('init');
    // @ts-ignore
    this.config = this.execWaterfallSync('configure', config);
    // @ts-ignore
    this.exec('ready');
  }

  traceBranch() {
    return makeTraceBranch(this);
  }

  traceRoot() {
    return this;
  }

  get actions() {
    // @ts-ignore -- actions from proxy
    return this.traceBranch().actions;
  }
}

/**
 * Make a new Gasket instance.
 * @param {import('@gasket/core').GasketConfigDefinition} configDef - Gasket configuration
 * @returns {Gasket} gasket instance
 */
export function makeGasket(configDef) {
  return new Gasket(configDef);
}
