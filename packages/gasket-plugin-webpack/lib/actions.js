/// <reference types="@gasket/plugin-logger" />

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import WebpackMetricsPlugin from './webpack-metrics-plugin.js';
import GasketEnvGuardPlugin from './gasket-env-guard-plugin.js';

/**
 * Sets up a context object with special getters
 * @type {import('./internal.d.ts').setupContext}
 */
function setupContext(context) {
  return {
    ...context,
    get webpack() {
      const webpack = require('webpack');
      return webpack;
    }
  };
}

/** @type {import('@gasket/core').ActionHandler<'getWebpackConfig'>} */
export function getWebpackConfig(gasket, initConfig, context) {

  /** @type {import('webpack').Configuration} */
  const baseConfig = {
    ...initConfig,
    plugins: [
      ...(initConfig && initConfig.plugins ? initConfig.plugins : []),
      new WebpackMetricsPlugin({ gasket }),
      new GasketEnvGuardPlugin()
    ].filter(Boolean)
  };

  baseConfig.resolve ??= {};
  baseConfig.resolve.alias ??= {};


  const alias = /** @type {Record<string, string | false>} */ (baseConfig.resolve.alias);
  alias.webpack = false;
  baseConfig.resolve.alias = alias;

  return gasket.execWaterfallSync('webpackConfig', baseConfig, setupContext(context));
}

export default {
  getWebpackConfig
};
