import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Parses JSON file or string to assign to context
 *
 * @param {CreateContext} context - Create context.
 * @param {Object} configFlags - flags to read config from
 * @param {string} configFlags.config - JSON string of config values
 * @param {string} configFlags.configFile - path to JSON file of config values
 */
export function readConfig(context, { config, configFile }) {
  if (config) {
    const parsedConfig = JSON.parse(config);
    Object.assign(context, parsedConfig);
  } else if (configFile) {
    const parsedConfigFile = require(path.resolve(context.cwd, configFile));
    Object.assign(context, parsedConfigFile);
  }
}

