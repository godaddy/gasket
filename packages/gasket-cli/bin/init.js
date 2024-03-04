#!/usr/bin/env node
/* eslint-disable max-statements */
const debug = require('diagnostics')('gasket:cli:hooks:init');
const { processOptions, processCommand } = require('../src/utils/commands');
const { loadGasketConfigFile, assignPresetConfig } = require('@gasket/resolve');
const { getEnvironment, addDefaultPlugins } = require('../src/config/utils');
const PluginEngine = require('@gasket/engine');

function parseEnvOption(argv) {
  const regex = /--env=|--env/;
  const match = argv.find(arg => regex.test(arg));
  const index = argv.indexOf(match);

  if (index > -1) {
    return match.includes('=')
      ? argv[index].split('=')[1]
      : argv[index + 1];
  }

  return 'local';
}

function handleEnvVars({ env, root, id, gasketConfig }) {
  if (!process.env.GASKET_ENV) process.env.GASKET_ENV = env;
  if (!process.env.GASKET_CONFIG) process.env.GASKET_CONFIG = gasketConfig;
  if (!process.env.GASKET_ROOT) process.env.GASKET_ROOT = root;
  if (!process.env.GASKET_COMMAND) process.env.GASKET_COMMAND = id;
}

async function init({ id, config, argv }) {
  debug('id', id);
  debug('argv', argv);

  // avoid config logging for help command
  const warn = id !== 'help' ? console.warn : f => f;

  try {
    const { root, bin, options } = config;
    options.env = parseEnvOption(argv);
    const env = getEnvironment(options, id, warn);
    handleEnvVars({ env, root, id, gasketConfig: options.gasketConfig})
    debug('Detected gasket environment', env);

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

      await gasket.exec('init');
      gasket.config = await gasket.execWaterfall('configure', gasket.config);
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
