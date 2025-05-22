/* eslint-disable no-console, no-process-env */

import { GasketEngine, lifecycleMethods } from './engine.js';
import { makeTraceBranch } from './trace.js';
import { applyConfigOverrides } from '@gasket/utils/config';

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

/**
 * Normalize ESM and CommonJS plugins to raw Plugin[]
 * @param {(import('@gasket/core').Plugin | { default: import('@gasket/core').Plugin })[]} plugins
 * @returns {import('@gasket/core').Plugin[]}
 */
function normalizePlugins(plugins) {
  return plugins
    .filter(Boolean)
    .map(p => 'default' in p ? p.default : p)
    .filter(p => p.name || p.hooks);
}

/* eslint-enable no-console, no-process-env */

/**
 * The Gasket class is the main entry point for the Gasket API.
 * @type {import('@gasket/core').Gasket}
 */
export class Gasket {
  /** These will be assigned dynamically later */
  exec;
  execSync;
  execWaterfall;
  execWaterfallSync;

  /**
   * @param {import('@gasket/core').GasketConfigDefinition} configDef - Gasket configuration
   */
  constructor(configDef) {
    const env = getEnvironment();
    const config = applyConfigOverrides(configDef, { env });
    config.env = env;
    config.root ??= process.cwd();

    // Normalize plugins before assigning or using
    const plugins = normalizePlugins(config.plugins);
    config.plugins = plugins;

    const resolvedConfig = /** @type {import('@gasket/core').GasketConfig} */ (config);

    // Start the engine
    this.engine = new GasketEngine(plugins);

    // Proxy lifecycle methods through trace branch
    lifecycleMethods.forEach(method => {
      this[method] = (...args) => this.traceBranch()[method](...args);
    });

    this.hook = this.engine.hook.bind(this.engine);
    this.config = resolvedConfig;

    // Can be used as a key to identify a gasket instance
    this.symbol = Symbol('gasket');

    const self = /** @type {import('@gasket/core').Gasket} */ (this);
    self.execSync('init');
    this.config = self.execWaterfallSync('configure', resolvedConfig);

    this.isReady = new Promise((resolve) => {
      (async () => {
        this.config = await self.execWaterfall('prepare', this.config);
        await self.exec('ready');
        resolve();
      })();
    });
  }

  traceBranch() {
    return makeTraceBranch(this);
  }

  traceRoot() {
    return this;
  }

  get actions() {
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
