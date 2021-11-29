const { name, devDependencies } = require('./package');

/**
* Creates the webpack config
* @param  {Gasket} gasket     The Gasket API
* @param {Object} initConfig  Initial webpack config
* @param {Object} context     Additional context-specific information
* @returns {Object}           Final webpack config
*/
function initWebpack(gasket, initConfig, context) {
  const webpack = require('webpack');
  const WebpackChain = require('webpack-chain');
  const webpackMerge = require('webpack-merge');
  const WebpackMetricsPlugin = require('./webpack-metrics-plugin');

  const { execSync, execWaterfallSync, config } = gasket;

  const standardPlugins = { plugins: [new WebpackMetricsPlugin({ gasket })] };

  const chain = new WebpackChain();
  execSync('webpackChain', chain, context);

  const baseConfig = webpackMerge.smart(
    initConfig,
    standardPlugins,
    chain.toConfig(),         // From webpackChain (partial)
    config.webpack || {}      // From gasket config file (partial)
  );

  const configPartials = execSync('webpack', baseConfig, context).filter(Boolean);
  const mergedConfig = webpackMerge.smart(
    baseConfig,
    ...configPartials
  );

  return execWaterfallSync(
    'webpackConfig',
    mergedConfig,
    { ...context, webpack, webpackMerge }
  );
}

module.exports = {
  name,
  hooks: {
    create(gasket, context) {
      const { pkg } = context;
      pkg.add('devDependencies', {
        webpack: devDependencies.webpack
      });
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        guides: [{
          name: 'Webpack Configuration Guide',
          description: 'Configuring Webpack in Gasket apps',
          link: 'docs/webpack.md'
        }],
        lifecycles: [{
          name: 'webpackChain',
          method: 'execSync',
          description: 'Setup webpack config by chaining',
          link: 'README.md#webpackChain',
          parent: 'initWebpack'
        }, {
          name: 'webpack',
          method: 'execSync',
          description: 'Modify webpack config with partials or by mutating',
          link: 'README.md#webpack',
          parent: 'initWebpack',
          after: 'webpackChain'
        }, {
          name: 'webpackConfig',
          method: 'execWaterfallSync',
          description: 'Transform the webpack config, with the help of webpack-merge',
          link: 'README.md#webpackConfig',
          parent: 'initWebpack',
          after: 'webpack'
        }, {
          name: 'initWebpack',
          description: 'Create a webpack config',
          command: 'build',
          link: 'README.md#initwebpack'
        }]
      };
    }
  },
  initWebpack
};
