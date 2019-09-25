const debug = require('diagnostics')('gasket:cli:hooks:init');
/**
 * oclif hook that loads the gasket.config and instantiates the plugin-engine.
 *
 * @param {String} id - Name of the command
 * @param {Object} oclifConfig - oclif configuration
 * @param {Object} argv - command line arguments
 * @async
 */
async function initHook({ id, config: oclifConfig, argv }) {
  debug('id', id);
  debug('argv', argv);

  // gasket create does not have a config file present.
  if (id === 'create' || id === '--help' || id === 'readme') return;

  const { parse } = require('@oclif/parser');
  const { GasketCommand } = require('@gasket/command-plugin');
  const getGasketConfig = require('../config/loader');
  const PluginEngine = require('@gasket/plugin-engine');

  const { flags } = parse(argv, {
    context: this,
    flags: GasketCommand.flags,
    strict: false
  });

  try {
    const gasketConfig = await getGasketConfig(flags);
    oclifConfig.gasket = new PluginEngine(gasketConfig);
    await oclifConfig.gasket.exec('initOclif', { oclifConfig });

  } catch (err) {
    this.error(err, { exit: 1 });
  }
}

module.exports = initHook;
