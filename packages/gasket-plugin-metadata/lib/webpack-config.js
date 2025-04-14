/// <reference types="@gasket/plugin-webpack" />

const { name } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
export default function webpackConfigHook(gasket, webpackConfig) {
  webpackConfig.resolve.alias[name] = false;
  return webpackConfig;
}
