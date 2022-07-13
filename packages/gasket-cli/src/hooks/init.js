/* eslint-disable max-statements */
const debug = require('diagnostics')('gasket:cli:hooks:init');

/**
 * oclif hook that loads the gasket.config and instantiates the engine.
 *
 * @param {String} id - Name of the command
 * @param {Object} oclifConfig - oclif configuration
 * @param {Object} argv - command line arguments
 * @async
 */
async function initHook({ id, config: oclifConfig, argv }) {
  debug('id', id);
  debug('argv', argv);

  // end early for create cmd which does not use gasket.config
  if (id === 'create') return;
  // avoid config logging for help command
  const warn = id !== 'help' ? this.warn : f => f;

  const { parse } = require('@oclif/parser');
  const { GasketCommand } = require('@gasket/plugin-command');
  const { loadGasketConfigFile, assignPresetConfig } = require('@gasket/resolve');
  const { getEnvironment, addDefaultPlugins } = require('../config/utils');
  const PluginEngine = require('@gasket/engine');

  const { flags } = parse(argv, {
    context: this,
    flags: GasketCommand.flags,
    strict: false
  });
  const { root, config } = flags;

  try {
    const env = getEnvironment(flags, id, warn);

    // expose Gasket settings on process
    process.env.GASKET_ENV = env;
    process.env.GASKET_CONFIG = config;
    process.env.GASKET_ROOT = root;
    process.env.GASKET_COMMAND = id;

    let gasketConfig = await loadGasketConfigFile(root, env, id, config);
    console.log('-- gasketConfig --', gasketConfig);

    if (gasketConfig) {
      gasketConfig = addDefaultPlugins(gasketConfig);
      console.log('-- gasketConfig - addDefaultPlugins --', gasketConfig);

      const gasket = new PluginEngine(gasketConfig, { resolveFrom: root });
      console.log('-- gasket --', gasket);
      assignPresetConfig(gasket);
      console.log('-- gasket - assignPresetConfig --', gasket);

      oclifConfig.gasket = gasket;
      await gasket.exec('initOclif', { oclifConfig });
    } else {
      warn('No gasket.config file was found.');
    }

  } catch (err) {
    this.error(err, { exit: 1 });
  }
}

module.exports = initHook;
