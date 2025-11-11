/// <reference types="@gasket/plugin-webpack" />

import packageJson from '../package.json' with { type: 'json' };
const { name } = packageJson;

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
export default function webpackConfigHook(gasket, webpackConfig) {
  webpackConfig.resolve.alias[name] = false;
  return webpackConfig;
}
