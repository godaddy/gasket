#!/usr/bin/env node
/* eslint-disable max-statements */
const debug = require('diagnostics')('gasket:cli:hooks:init');
const { processOptions, processCommand } = require('../src/utils/commands');
const { loadGasketConfigFile, assignPresetConfig } = require('@gasket/resolve');
const { parseEnvOption, handleEnvVars } = require('../src/utils/env-util');
const { getEnvironment, addDefaultPlugins } = require('../src/config/utils');
const PluginEngine = require('@gasket/engine');

/**
 * init - Initialize the Gasket CLI
 * @property {string} id Command id
 * @property {object} config.bin Commander instance
 * @property {object} config.root Root directory
 * @property {object} config.options Command options/flags
 * @property {object} argv Command arguments
 */
async function init({ id, config, argv }) {
  debug('id', id);
  debug('argv', argv);

  // avoid config logging for help command
  const warn = id !== 'help' ? console.warn : f => f;

  try {
    const { root, bin, options } = config;
    // Parse the env option manually before Commander does its own parsing
    options.env = parseEnvOption(argv);
    const env = getEnvironment(options, id, warn);
    // Set environment variables for gasket
    handleEnvVars({ env, root, id, gasketConfig: options.gasketConfig})
    debug('Detected gasket environment', env);

    let configFile = await loadGasketConfigFile(root, env, id, options.gasketConfig);
    if (configFile) {
      configFile = addDefaultPlugins(configFile);

      const gasket = new PluginEngine(configFile, { resolveFrom: root });
      assignPresetConfig(gasket);
      config.gasket = gasket;
      config.gasket.command = { id, argv };

      // Add global options to the bin
      const globalOptions = (await gasket.exec('getCommandOptions', config))
        .reduce((all, opts) => all.concat(opts), [])
        .filter(opt => Boolean(opt));
      processOptions(globalOptions).forEach(opt => bin.option(...opt));

      // Add commands to the bin
      const commands = (await gasket.exec('getCommands', config))
        .reduce((all, cmds) => all.concat(cmds), [])
        .filter(cmd => Boolean(cmd))
        .map(cmd => processCommand(cmd));
      commands.forEach(cmd => bin.addCommand(cmd));

      // Initialize Gasket
      await gasket.exec('init');
      gasket.config = await gasket.execWaterfall('configure', gasket.config);
      // Parse command options and execute command action
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
