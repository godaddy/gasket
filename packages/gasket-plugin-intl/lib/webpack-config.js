/** @type {import('@gasket/engine').HookHandler<'webpackConfig'>} */
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
