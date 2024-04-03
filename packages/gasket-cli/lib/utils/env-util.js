/**
 * parseEnvOption - Parses the environment option from argv
 * We need to parse this option early before Commander does its own parsing
 * @param {process.argv} argv The process arguments
 * @returns {string} Parsed environment option
 */
function parseEnvOption(argv) {
  const regex = /--env=|--env/;
  const match = argv.find(arg => regex.test(arg));
  const index = argv.indexOf(match);

  if (index > -1) {
    return match.includes('=')
      ? argv[index].split('=')[1]
      : argv[index + 1];
  }

  return '';
}

/**
 * handleEnvVars - Set environment variables for gasket
 * @property {string} env Environment
 * @property {string} root Root directory
 * @property {string} id Command id
 * @property {string} gasketConfig Gasket config file name
 * @returns {void}
 */
function handleEnvVars({ env, root, id, gasketConfig }) {
  if (!process.env.GASKET_ENV) process.env.GASKET_ENV = env;
  if (!process.env.GASKET_CONFIG) process.env.GASKET_CONFIG = gasketConfig;
  if (!process.env.GASKET_ROOT) process.env.GASKET_ROOT = root;
  if (!process.env.GASKET_COMMAND) process.env.GASKET_COMMAND = id;
}

module.exports = {
  parseEnvOption,
  handleEnvVars
};
