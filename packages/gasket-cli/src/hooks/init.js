const debug = require('diagnostics')('gasket:cli:hooks:init');
const Metrics = require('../metrics');

/* eslint-disable max-statements */
async function initHook({ id, config: oclifConfig, argv }) {
  debug('id', id);
  debug('argv', argv);

  // gasket create does not have a config file present.
  if (id === 'create' || id === '--help' || id === 'readme') return;

  const { parse } = require('@oclif/parser');
  const PluginEngine = require('@gasket/plugin-engine');
  const GasketCommand = require('../command');
  const getGasketConfig = require('../config/loader');
  const defaultPlugins = require('./default-plugins');

  const { flags } = parse(argv, {
    context: this,
    flags: GasketCommand.flags,
    strict: false
  });

  let gasketConfig;

  try {
    gasketConfig = await getGasketConfig(flags);

    gasketConfig.plugins.add = gasketConfig.plugins.add || [];
    gasketConfig.plugins.add.push(...defaultPlugins);

    oclifConfig.gasket = new PluginEngine(gasketConfig);

    const metrics = new Metrics(gasketConfig, flags.record, id);

    // we don't await this call so we don't block anything
    metrics.report()
      .then(data => oclifConfig.gasket.exec('metrics', data))
      .catch(this.error);

  } catch (err) {
    this.error(err, { exit: 1 });
  }

  await oclifConfig.gasket.exec('initOclif', {
    oclifConfig,
    BaseCommand: GasketCommand
  });
}


module.exports = initHook;
