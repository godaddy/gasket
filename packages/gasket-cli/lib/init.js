/* eslint-disable max-statements */
const debug = require('diagnostics')('gasket:cli:hooks:init');
const { getEnvironment } = require('./config/utils');
const {
  parseEnvOption,
  handleEnvVars
} = require('./utils');

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

  // avoid config logging for help command or no command
  const warn = id && id !== 'help' ? console.warn : f => f;

  try {
    const { root, options } = config;
    // Parse the env option manually before Commander does its own parsing
    options.env = parseEnvOption(argv);
    const env = getEnvironment(options, id, warn);
    // Set environment variables for gasket
    handleEnvVars({ env, root, id, gasketConfig: options.gasketConfig });
    debug('Detected gasket environment', env);

    // TODO: investigate an alternate CLI init
  } catch (err) {
    console.error(err, { exit: 1 });
  }
}

module.exports = init;
