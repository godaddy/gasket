const { Command, flags } = require('@oclif/command');

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
   * Gasket Config.
   *
   * @param {object} gasketConfig - Gasket configurations
   * @returns {object} gasketConfig
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
     * @property {object} command - Details of command
     * @property {string} command.id - Name of command
     * @property {object} command.flags - Flags
     * @property {string[]} command.argv - Ordered Arguments
     * @property {object} command.args - Named arguments
     * @property {object} config - Loaded and modified configuration
     * @property {string} config.env - Environment set by command flags
     */
    this.gasket = this.config.gasket;

    /**
     * Flags and arguments passed with CLI command.
     *
     * @type {ParserOutput} parsed - Parsed flags and args
     * @property {object} parsed.flags - Flags
     * @property {string[]} parsed.argv - Ordered Arguments
     * @property {object} parsed.args - Named arguments
     */
    this.parsed = this.parse(this.constructor);
    this.parsed.flags = this.parsed.flags || {};

    // Provide details of invoked command to lifecycles
    this.gasket.command = {
      id: this.id,
      ...this.parsed
    };

    // Allow command subclasses to modify config
    this.gasket.config = await this.gasketConfigure(this.gasket.config);

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
 * @type {object} flags
 * @property {string} config - Fully qualified gasket config to load (default: `'gasket.config'`)
 * @property {string} root - Top-level app directory (default: `process.cwd()`)
 * @property {string} env - Target runtime environment (default: `GASKET_ENV` or `'development'`)
 */
GasketCommand.flags = {
  config: flags.string({
    env: 'GASKET_CONFIG',
    default: 'gasket.config',
    char: 'c',
    description: 'Fully qualified Gasket config to load'
  }),
  root: flags.string({
    env: 'GASKET_ROOT',
    default: process.env.FAUX_ROOT || process.cwd(), // eslint-disable-line no-process-env
    description: 'Top-level app directory'
  }),
  env: flags.string({
    env: 'GASKET_ENV',
    description: 'Target runtime environment'
  }),
  require: flags.string({
    description: 'Require module before Gasket is initialized',
    char: 'r',
    multiple: true
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
