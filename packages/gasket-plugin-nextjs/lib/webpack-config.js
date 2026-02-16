/// <reference types="@gasket/plugin-webpack" />

import { createRequire } from 'module';
import { dirname, join } from 'path';
import tryResolve from './utils/try-resolve.js';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);

// Matches: @gasket/plugin-* or @*/gasket-plugin-*
const isGasketPluginPath = /(@gasket\/plugin-|@[\w-]+\/gasket-plugin-)/;
const isGasketCore = /@gasket[/\\]core$/;

// Generate empty module programmatically to avoid committing a file
const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const emptyModulePath = join(dirName, 'noop-replacement.mjs');

/**
 * Function to validate that '@gasket/core' is not used in browser code.
 * If '@gasket/core' is found in the module request, an error is thrown.
 * @param {{ request: string, dependencyType?: string }} ctx - The context object containing the request string.
 * @param {(error?: Error | null, result?: any) => void} callback - The externals callback.
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
 * @param {{ request: string, dependencyType?: string }} ctx - The context object containing the request string.
 * @param {(error?: Error | null, result?: any) => void} callback - The externals callback.
 * @returns {void|*} Returns void or the result of the callback
 */
function externalizeGasketCore(ctx, callback) {
  if (isGasketCore.test(ctx.request)) {
    const externalsType = ctx.dependencyType === 'esm' ? 'module' : 'commonjs';
    return callback(null, [externalsType, ctx.request].join(' '));
  }
  return callback();
}

/**
 * Setup webpack resolve aliases
 * @param {import('webpack').Configuration} webpackConfig
 *   The webpack configuration object
 * @param {string} root - Gasket config root path
 * @returns {Function} Exclude function to exclude modules from the bundle
 */
function setupResolveAliases(webpackConfig, root) {
  webpackConfig.resolve ??= {};
  webpackConfig.resolve.alias ??= {};

  // This is only needed for configuring webpack and should not be bundled to avoid require function warnings
  webpackConfig.resolve.alias[require.resolve('./utils/try-resolve.js')] = false;

  const exclude = (moduleName) => {
    const resolved = tryResolve(moduleName, [root]);
    if (resolved) {
      webpackConfig.resolve.alias[resolved] = false;
    }
  };

  return exclude;
}

/**
 * Setup client-side externals
 * @param {import('webpack').Configuration} webpackConfig
 *   The webpack configuration object
 * @param {Function} exclude - Function to exclude modules from the bundle
 * @returns {void}
 */
function setupClientExternals(webpackConfig, exclude) {
  exclude('./gasket.js');
  exclude('./src/gasket.js');
  exclude('./gasket.mjs');
  exclude('./src/gasket.mjs');
  exclude('./gasket.ts');
  exclude('./src/gasket.ts');
  exclude('./dist/gasket.js');

  /** @type {any[]} */ (webpackConfig.externals).unshift(validateNoGasketCore);
}

/**
 * Replace create.js and webpack-config.js files with empty.mjs
 * @param {import('webpack').WebpackPluginInstance} webpack - The webpack plugin instance
 * @param {import('webpack').Configuration} webpackConfig - The webpack configuration
 * @returns {import('webpack').Configuration} The modified webpack configuration
 */
function replaceGasketFiles(webpack, webpackConfig) {
  // Replace create.js and webpack-config.js files with empty.mjs
  // These files are build-time only and use Node APIs that don't work in Edge runtime or RSC
  // Replace them with an empty module so imports still work but don't bundle Node APIs
  // Apply to all builds (server, edge, RSC) to prevent Node API errors
  // Only replace files in Gasket plugin paths (@gasket/plugin-* or @*/gasket-plugin-*)
  webpackConfig.plugins ??= [];
  webpackConfig.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /(create|webpack-config)\.m?c?js$/,
      (resource) => {
        // Only replace if the resource is from a Gasket plugin
        // Check both context (module path) and request (import path)
        const context = resource.context || '';
        const request = resource.request || '';

        if (isGasketPluginPath.test(context) || isGasketPluginPath.test(request)) {
          resource.request = emptyModulePath;
        }
      }
    )
  );

  return webpackConfig;
}

/**
 * Webpack configuration hook for Next.js integration
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 * @returns {import('webpack').Configuration} Modified webpack configuration
 */
function webpackConfigHook(gasket, webpackConfig, { webpack, isServer }) {
  const exclude = setupResolveAliases(webpackConfig, gasket.config.root);

  if (Array.isArray(webpackConfig.externals)) {
    if (!isServer) {
      setupClientExternals(webpackConfig, exclude);
    }
  } else {
    throw new Error('Expected webpackConfig.externals to be an array');
  }

  webpackConfig.plugins.push(
    new webpack.EnvironmentPlugin({
      GASKET_ENV: gasket.config.env
    })
  );

  return replaceGasketFiles(webpack, webpackConfig);
}

export { validateNoGasketCore, externalizeGasketCore, replaceGasketFiles, webpackConfigHook as webpackConfig };
