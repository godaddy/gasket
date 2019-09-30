const { Command, flags } = require('@oclif/command');
const { applyEnvironmentOverrides } = require('@gasket/utils');

const GasketCommand = module.exports = class GasketCommand extends Command {
  async run() {
    await this.gasket.exec('init');
    await this.runHooks();
  }

  runHooks() {
    throw new Error('The `runHooks` method must be overridden');
  }

  /**
   * Configures the environment, allowing commands that extend this class to
   * adjust configs and flags before apply env overrides.
   *
   * @param {Object} gasketConfig - Gasket configurations
   * @returns {Promise<{Object}>} gasketConfig
   */
  async configure(gasketConfig) {
    //
    // make all flags parsed for this command available from config
    //
    gasketConfig.flags = this.flags || {};
    //
    // Set the env to user/commmand defined flag value if set
    //
    gasketConfig.env = gasketConfig.flags.env || gasketConfig.env;
    if (!gasketConfig.env) {
      gasketConfig.env = 'development';
      this.warn('No env specified, falling back to "development".');
    }

    return applyEnvironmentOverrides(gasketConfig, gasketConfig, './gasket.config.local');
  }

  async init() {
    await super.init();
    this.flags = this.parse(this.constructor);

    // "this.config" is the context that the init hook injected "gasket" into
    this.gasket = this.config.gasket;
    // provide the name of the command used to invoke lifecycles
    this.gasket.command = this.id;

    // Allow commands to modify config
    let gasketConfig = await this.configure(this.gasket.config);
    // Allow plugins to modify config
    gasketConfig = await this.gasket.execWaterfall('configure', gasketConfig);
    this.gasket.config = gasketConfig;
  }
};

/**
 * These are required for all gasket commands, required by the CLI for loading
 * the appropriate gasket.config file and environment.
 *
 * @type {{Object} flags
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
    default: process.env.FAUX_ROOT || process.cwd(),
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
