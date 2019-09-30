const path = require('path');
const untildify = require('untildify');
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

  configure(gasketConfig) {
    // Allow any user provided flags to overwrite any user provided config.
    const userFlags = this.flags || {};
    gasketConfig.env = userFlags.env || gasketConfig.env;
    if (!gasketConfig.env) {
      gasketConfig.env = 'development';
      this.warn('No env specified, falling back to "development".');
    }

    return applyEnvironmentOverrides(gasketConfig, gasketConfig, './gasket.config.local');
  }

  async init() {
    await super.init();

    const { flags: userFlags } = this.parse(this.constructor);
    this.flags = userFlags;

    // "this.config" is the context that the init hook injected "gasket" into
    this.gasket = this.config.gasket;
    // provide the name of the command used to invoke lifecycles
    this.gasket.command = this.id;
    this.gasket.config = await this.gasket.execWaterfall('configure', this.configure(this.gasket.config));
  }
};

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
  npmconfig: flags.string({
    env: 'GASKET_NPM_USERCONFIG',
    default: '~/.npmrc',
    description: '.npmrc to be used for npm actions in @gasket/cli',
    parse: (filepath) => {
      filepath = untildify(filepath);
      if (path.isAbsolute(filepath)) return filepath;
      return path.resolve(process.cwd(), filepath);
    }
  }),
  env: flags.string({
    env: 'NODE_ENV',
    description: 'Target runtime environment'
  }),
  record: flags.boolean({
    env: 'GASKET_RECORD',
    default: true,
    description: 'Whether or not to emit this command as part of Gasket\'s metrics lifecycle',
    allowNo: true
  })
};
