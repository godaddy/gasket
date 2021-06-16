const WebpackChain = require('webpack-chain');
const webpackMerge = require('webpack-merge');
const WebpackMetricsPlugin = require('./webpack-metrics-plugin');
const { name, devDependencies } = require('./package');

/**
* Creates the webpack config
* @param  {Gasket} gasket The Gasket API
* @param {Object} webpackConfig Initial webpack config
* @param {Object} data Additional info
* @returns {Object} Final webpack config
*/
function initWebpack(gasket, webpackConfig, data) {
  const { execSync, execWaterfallSync, config } = gasket;

  const chain = new WebpackChain();
  execSync('webpackChain', chain, data);

  //
  // Merge defaults with gasket.config webpack.
  //
  const chainConfig = webpackMerge.smart(
    webpackConfig,
    { plugins: [new WebpackMetricsPlugin({ gasket })] },
    chain.toConfig(),     // Webpack chain from plugins (partial)
    config.webpack || {}  // Webpack config from user (partial)
  );

  return execWaterfallSync(
    'webpackMerge',
    webpackMerge.smart(
      chainConfig,
      ...execSync('webpack', chainConfig, data).filter(Boolean)
    ),
    data,
    webpackMerge
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
          name: 'webpackMerge',
          method: 'execWaterfallSync',
          description: 'Transform the webpack config, with the help of webpack-merge',
          link: 'README.md#webpackMerge',
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
