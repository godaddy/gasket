const isGasketCore = /@gasket[/\\](core)/;

function validateNoGasketCore(ctx, callback) {
  if (isGasketCore.test(ctx.request)) {
    return callback(new Error('@gasket/core should not be used in browser code.'));
  }
  return callback();
}

/**
 * Externalize @gasket/core in the server build.
 * We do this to enable GASKET_ENV to be picked up and passed to the plugins.
 * Otherwise, unique builds per environment would be required.
 *
 * @param ctx
 * @param callback
 * @returns {*}
 */
function externalizeGasketCore(ctx, callback) {
  if (isGasketCore.test(ctx.request)) {
    const externalsType = ctx.dependencyType === 'esm' ? 'module' : 'commonjs';
    return callback(null, [externalsType, ctx.request].join(' '));
  }
  return callback();
}

/**
 * Configure Next.js Webpack for @gasket/core
 *
 * @param {Object} gasket - The gasket API.
 * @param {Object} webpackConfig - Initial Next.js webpack config
 * @returns {Object} Partial webpack config with UXCore2 support.
 * @public
 */
function webpackConfigHook(gasket, webpackConfig) {
  if (webpackConfig.name === 'client') {
    webpackConfig.externals.unshift(validateNoGasketCore);
  } else {
    webpackConfig.externals.unshift(externalizeGasketCore);

    // TODO: If we find a reason NOT to externalized the core package,
    //  then we must set the GASKET_ENV which requires builds per environment.
    // webpackConfig.plugins.push(
    //   new webpack.EnvironmentPlugin({
    //     GASKET_ENV: gasket.config.env
    //   })
    // );
  }

  return webpackConfig;
}

module.exports = {
  validateNoGasketCore,
  externalizeGasketCore,
  webpackConfig: webpackConfigHook
};
