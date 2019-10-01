const { Command, flags } = require('@oclif/command');
const { applyEnvironmentOverrides } = require('@gasket/utils');

/**
 * The GasketCommand can be extended to allow plugins to introduce new CLI
 * commands to invoke Gasket lifecycles.
 */
class GasketCommand extends Command {

  /**
   * Abstract method which must be implemented by subclasses, used to execute
   * Gasket lifecycles, following the `configure` and `init` Gasket lifecycles.
   * @async
   * @abstract
   */
  async gasketRun() {
    throw new Error('The `gasketRun` method must be implemented');
  }

  /**
   * Virtual method which may be overridden by subclasses, to adjust the
   * Gasket Config before env overrides are applied.
   *
   * @param {Object} gasketConfig - Gasket configurations
   * @returns {Promise<{Object}>} gasketConfig
   * @virtual
   */
  async gasketConfigure(gasketConfig) { return gasketConfig; }

  /**
   * Implements the oclif Command method, executed during oclif lifecycles.
   * GasketCommand subclasses should implement the `gasketRun` method.
   * @override
   * @async
   * @private
   */
  async run() {
    await this.gasket.exec('init');
    await this.gasketRun();
  }

  /**
   * Implements the oclif Command method, executed during oclif lifecycles.
   * This finalizes the Gasket Config, and makes the Gasket API available
   * to GasketCommand subclasses for executing lifecycles.
   * @override
   * @async
   * @private
   */
  async init() {
    await super.init();
    // "this.config" is the context that the init hook injected "gasket" into
    this.gasket = this.config.gasket;
    this.parsed = this.parse(this.constructor);
    const parsedFlags = this.parsed.flags || {};

    // Provide details of invoked command to lifecycles
    this.gasket.command = {
      id: this.id,
      flags: parsedFlags
    };

    let gasketConfig = this.gasket.config;

    // Setup config env based on env flag if set
    gasketConfig.env = parsedFlags.env || gasketConfig.env;

    // Allow command subclasses to modify config
    gasketConfig = await this.gasketConfigure(gasketConfig);

    if (!gasketConfig.env) {
      gasketConfig.env = 'development';
      this.warn('No env specified, falling back to "development".');
    }

    gasketConfig = applyEnvironmentOverrides(gasketConfig, gasketConfig, './gasket.config.local');

    // Allow plugins to modify config
    gasketConfig = await this.gasket.execWaterfall('configure', gasketConfig);
    this.gasket.config = gasketConfig;
  }
}

/**
 * These are required for all gasket commands, required by the CLI for loading
 * the appropriate gasket.config file and environment.
 *
 * @type {Object} flags
 */
GasketCommand.flags = {
  config: flags.string({
    env: 'GASKET_CONFIG',
    default: 'gasket.config',
    char: 'c',
    description: 'Fully qualified gasket config to load'
  }),
  root: flags.string({
    env: 'GASKET_ROOT',
    default: process.env.FAUX_ROOT || process.cwd(), // eslint-disable-line no-process-env
    char: 'r',
    description: 'Top-level app directory'
  }),
  env: flags.string({
    env: 'NODE_ENV',
    description: 'Target runtime environment'
  })
};

// TODO (agerard): Should be added dynamically by @gasket/metrics-plugin.
GasketCommand.flags.record = flags.boolean({
  env: 'GASKET_RECORD',
  default: true,
  description: 'Whether or not to emit this command as part of Gasket\'s metrics lifecycle',
  allowNo: true
});

module.exports = GasketCommand;
