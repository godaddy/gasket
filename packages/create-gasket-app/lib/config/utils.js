import { default as diagnostics } from 'diagnostics';
const debug = diagnostics('gasket:cli:config:utils');

/**
 * Returns specified env option if set or appropriate fallback
 *
 * @param {Object} options - CLI Option
 * @param {string} commandId - Name of the command
 * @param {function} warn - Warning logger
 * @returns {string} environment
 */
export function getEnvironment(options, commandId, warn) {
  if (options.env) {
    debug('Environment was passed through command line options', options.env);
    return options.env;
  }

  // special snowflake case to match up `local` env with command unless set
  if (commandId === 'local') {
    debug('Environment defaulting to `local` due to `local` command');
    return 'local';
  }

  const { NODE_ENV } = process.env;
  if (NODE_ENV) {
    warn(`No env specified, falling back to NODE_ENV: "${ NODE_ENV }".`);
    return NODE_ENV;
  }

  warn('No env specified, falling back to "development".');
  return 'development';
}
