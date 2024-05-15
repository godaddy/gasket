/// <reference types="@gasket/plugin-webpack" />

const { getSWConfig } = require('./utils/utils');

/**
 * Add the analyzer webpack plugin if analyze flag has been set
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 */
module.exports = function webpackConfigHook(gasket, webpackConfig, data) {
  const { command } = gasket;
  const swConfig = getSWConfig(gasket);

  const { webpackRegister } = swConfig;
  const { isServer } = data;

  // Do not register the service worker for local development or if webpackRegister is false
  if (webpackRegister !== false && !isServer && command.id !== 'local') {
    const WebpackInjectPlugin = require('webpack-inject-plugin').default;
    const { loadRegisterScript } = require('./utils/utils');

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
        new WebpackInjectPlugin(
          () => loadRegisterScript(swConfig),
          entryName && { entryName }
        )
      ]
    };
  }

  return webpackConfig;
};
