import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function sanitize(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

/** @type {import('../internal.js').readConfig} */
export function readConfig(context, { config, configFile }) {
  if (config) {
    const parsedConfig = JSON.parse(config);
    Object.assign(context, sanitize(parsedConfig));
  } else if (configFile) {
    const parsedConfigFile = require(path.resolve(context.cwd, configFile));
    Object.assign(context, sanitize(parsedConfigFile));
  }
}
