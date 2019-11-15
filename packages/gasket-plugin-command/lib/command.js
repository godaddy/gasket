const { Command, flags } = require('@oclif/command');
const { applyEnvironmentOverrides } = require('@gasket/utils');

/**
 * The GasketCommand can be extended to allow plugins to introduce new CLI
 * commands to invoke Gasket lifecycles.
 */
class GasketCommand extends Command {

  /**
   * Abstract method which must be implemented by subclasses, used to execute
   * Gasket lifecycles, following the `init` and `configure` Gasket lifecycles.
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
   * @returns {Object} gasketConfig
   * @async
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
    /**
     * Gasket Plugin engine instance with details of session
     *
     * @type {Gasket} gasket
     * @property {Object} command - Details of command
     * @property {String} command.id - Name of command
     * @property {Object} command.flags - Flags
     * @property {Array} command.argv - Ordered Arguments
     * @property {Object} command.args - Named arguments
     * @property {Object} config - Loaded and modified configuration
     * @property {String} config.env - Environment set by command flags
     */
    this.gasket = this.config.gasket;

    /**
     * Flags and arguments passed with CLI command.
     *
     * @type {ParserOutput} parsed - Parsed flags and args
     * @property {Object} parsed.flags - Flags
     * @property {Array} parsed.argv - Ordered Arguments
     * @property {Object} parsed.args - Named arguments
     */
    this.parsed = this.parse(this.constructor);
    const parsedFlags = this.parsed.flags = this.parsed.flags || {};

    // Provide details of invoked command to lifecycles
    this.gasket.command = {
      id: this.id,
      ...this.parsed
    };

    // Setup config env based on env flag if set
    this.gasket.config.env = parsedFlags.env || this.gasket.config.env;

    // Allow command subclasses to modify config
    this.gasket.config = await this.gasketConfigure(this.gasket.config);

    if (!this.gasket.config.env) {
      this.gasket.config.env = 'development';
      this.warn('No env specified, falling back to "development".');
    }

    this.gasket.config = applyEnvironmentOverrides(this.gasket.config, this.gasket.config, './gasket.config.local');
    // Allow plugins to do things with partial config state
    await this.gasket.exec('init');
    // Allow plugins to modify config
    this.gasket.config = await this.gasket.execWaterfall('configure', this.gasket.config);
  }
}

/**
 * These are required for all gasket commands, required by the CLI for loading
 * the appropriate gasket.config file and environment.
 *
 * @type {Object} flags
 * @property {string} config - Fully qualified gasket config to load (default: `'gasket.config'`)
 * @property {string} root - Top-level app directory (default: `process.cwd()`)
 * @property {string} env - Target runtime environment (default: `NODE_ENV` or `'development'`)
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

// TODO (agerard): Should be added dynamically by @gasket/plugin-metrics.
GasketCommand.flags.record = flags.boolean({
  env: 'GASKET_RECORD',
  default: true,
  description: 'Whether or not to emit this command as part of Gasket\'s metrics lifecycle',
  allowNo: true
});

module.exports = GasketCommand;
