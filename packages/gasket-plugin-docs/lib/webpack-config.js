/// <reference types="@gasket/plugin-webpack" />

const { name } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
module.exports = function webpackConfigHook(gasket, webpackConfig) {
  webpackConfig.resolve.alias[name] = false;
  return webpackConfig;
};
