/// <reference types="@gasket/plugin-webpack" />

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
module.exports = function webpackConfig(gasket, config, { webpack, isServer }) {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      new webpack.EnvironmentPlugin(
        [
          isServer ? 'GASKET_INTL_LOCALES_DIR' : null,
          'GASKET_INTL_MANIFEST_FILE'
        ].filter(Boolean)
      )
    ].filter(Boolean)
  };
};
