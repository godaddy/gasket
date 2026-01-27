/// <reference types="@gasket/plugin-webpack" />

import { getSWConfig, loadRegisterScript } from './utils/utils.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebpackInjectPluginModule = require('webpack-inject-plugin');
const WebpackInjectPlugin = WebpackInjectPluginModule.default || WebpackInjectPluginModule;

/**
 * Add the analyzer webpack plugin if analyze flag has been set
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 */
export default function webpackConfigHook(gasket, webpackConfig, data) {
  const { config: { command } } = gasket;
  const swConfig = getSWConfig(gasket);

  const { webpackRegister } = swConfig;
  const { isServer } = data;

  // Do not register the service worker for local development or if webpackRegister is false
  if (webpackRegister !== false && !isServer && command !== 'local') {

    let entryName;
    if (webpackRegister instanceof Function) {
      entryName = webpackRegister;
    } else if (webpackRegister instanceof Array) {
      entryName = (key) => webpackRegister.includes(key);
    } else if (typeof webpackRegister === 'string') {
      entryName = (key) => key === webpackRegister;
    }

    // return webpack config partial
    return {
      ...webpackConfig,
      plugins: [
        ...(webpackConfig.plugins || []),
        // @ts-expect-error - webpack-inject-plugin is CJS and types don't match ESM import
        new WebpackInjectPlugin(
          () => loadRegisterScript(swConfig),
          entryName && { entryName }
        )
      ]
    };
  }

  return webpackConfig;
}
