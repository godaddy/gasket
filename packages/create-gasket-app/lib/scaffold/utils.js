import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('../internal.js').readConfig} */
export function readConfig(context, { config, configFile }) {
  if (config) {
    const parsedConfig = JSON.parse(config);
    Object.assign(context, parsedConfig);
  } else if (configFile) {
    const parsedConfigFile = require(path.resolve(context.cwd, configFile));
    Object.assign(context, parsedConfigFile);
  }
}
