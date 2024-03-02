#!/usr/bin/env node
/* eslint-disable max-statements */
const debug = require('diagnostics')('gasket:cli:hooks:init');
const { processOptions, processCommand } = require('../src/utils/commands');

async function init({ id, config, argv }) {
  debug('id', id);
  debug('argv', argv);

  // avoid config logging for help command
  const warn = id !== 'help' ? console.warn : f => f;

  const { loadGasketConfigFile, assignPresetConfig } = require('@gasket/resolve');
  const { getEnvironment, addDefaultPlugins } = require('../src/config/utils');
  const PluginEngine = require('@gasket/engine');

  try {
    const { root, bin, options } = config;
    const env = getEnvironment(options, id, warn);
    debug('Detected gasket environment', env);

    // expose Gasket settings on process
    // Check if set first TODO
    process.env.GASKET_ENV = env;
    process.env.GASKET_CONFIG = options.gasketConfig;
    process.env.GASKET_ROOT = root;
    process.env.GASKET_COMMAND = id;

    let configFile = await loadGasketConfigFile(root, env, id, options.gasketConfig);
    if (configFile) {
      configFile = addDefaultPlugins(configFile);

      const gasket = new PluginEngine(configFile, { resolveFrom: root });
      assignPresetConfig(gasket);
      config.gasket = gasket;
      config.gasket.command = { id, argv };

      const globalOptions = (await gasket.exec('getCommandOptions', config))
        .reduce((all, opts) => all.concat(opts), [])
        .filter(opt => Boolean(opt));
      processOptions(globalOptions).forEach(opt => bin.option(...opt));

      const commands = (await gasket.exec('getCommands', config))
        .reduce((all, cmds) => all.concat(cmds), [])
        .filter(cmd => Boolean(cmd))
        .map(cmd => processCommand(cmd));
      commands.forEach(cmd => bin.addCommand(cmd));

      await bin.parseAsync();
    } else {
      await bin.parseAsync();
      warn('No gasket.config file was found.');
    }

  } catch (err) {
    console.error(err, { exit: 1 });
  }
}

module.exports = init;
