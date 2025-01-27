/// <reference types="@gasket/plugin-webpack" />

import pkg from '../package.json' with { type: 'json' };
const { name } = pkg;

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
export default function webpackConfigHook(gasket, webpackConfig) {
  webpackConfig.resolve.alias[name] = false;
  return webpackConfig;
}
