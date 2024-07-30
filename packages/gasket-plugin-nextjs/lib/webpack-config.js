/// <reference types="@gasket/plugin-webpack" />

const isGasketCore = /@gasket[/\\]core$/;

/**
 * Function to validate that '@gasket/core' is not used in browser code.
 * If '@gasket/core' is found in the module request, an error is thrown.
 * @param {object} ctx - The context object containing the request string.
 * @param {Function} callback - The externals callback.
 * @returns {void}
 */
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
 * @param {object} ctx - The context object containing the request string.
 * @param {Function} callback - The externals callback.
 * @returns {void|*}
 */
function externalizeGasketCore(ctx, callback) {
  if (isGasketCore.test(ctx.request)) {
    const externalsType = ctx.dependencyType === 'esm' ? 'module' : 'commonjs';
    return callback(null, [externalsType, ctx.request].join(' '));
  }
  return callback();
}

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
function webpackConfigHook(gasket, webpackConfig, { webpack, isServer }) {
  if (Array.isArray(webpackConfig.externals)) {
    if (!isServer) {
      if ('filename' in gasket.config) {
        webpackConfig.resolve ??= {};
        webpackConfig.resolve.alias ??= {};
        webpackConfig.resolve.alias[gasket.config.filename] = false;
      } else {
        gasket.logger.warn('Gasket `filename` was not configured in makeGasket');
      }

      webpackConfig.externals.unshift(validateNoGasketCore);
    }
  } else {
    throw new Error('Expected webpackConfig.externals to be an array');
  }

  webpackConfig.plugins.push(
    new webpack.EnvironmentPlugin({
      GASKET_ENV: gasket.config.env
    })
  );

  return webpackConfig;
}

module.exports = {
  validateNoGasketCore,
  externalizeGasketCore,
  webpackConfig: webpackConfigHook
};
