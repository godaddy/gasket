/// <reference types="@gasket/plugin-webpack" />

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const { name } = packageJson;

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
export default function webpackConfigHook(gasket, webpackConfig) {
  webpackConfig.resolve.alias[name] = false;
  return webpackConfig;
}
