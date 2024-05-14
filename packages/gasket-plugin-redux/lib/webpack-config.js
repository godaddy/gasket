/// <reference types="@gasket/plugin-webpack" />

/** @type {import('@gasket/engine').HookHandler<'webpackConfig'>} */
module.exports = function webpackConfigHook(
  gasket,
  webpackConfig,
  { webpack }
) {
  const { redux: reduxConfig } = gasket.config;

  return {
    ...webpackConfig,
    plugins: [
      ...(webpackConfig.plugins || []),
      new webpack.EnvironmentPlugin({
        GASKET_MAKE_STORE_FILE: reduxConfig.makeStore
      })
    ]
  };
};
