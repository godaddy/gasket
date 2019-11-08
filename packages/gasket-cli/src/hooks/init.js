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

  const { parse } = require('@oclif/parser');
  const { GasketCommand } = require('@gasket/plugin-command');
  const { getGasketConfig, assignPresetConfig } = require('../config/utils');
  const PluginEngine = require('@gasket/engine');

  const { flags } = parse(argv, {
    context: this,
    flags: GasketCommand.flags,
    strict: false
  });

  try {
    const gasketConfig = await getGasketConfig(flags);

    if (gasketConfig) {
      const resolveFrom = flags.root;
      const gasket = new PluginEngine(gasketConfig, { resolveFrom });
      assignPresetConfig(gasket);

      oclifConfig.gasket = gasket;
      await gasket.exec('initOclif', { oclifConfig });
    } else if (id !== 'help') {
      this.warn('No gasket.config file was found.');
    }

  } catch (err) {
    this.error(err, { exit: 1 });
  }
}

module.exports = initHook;
