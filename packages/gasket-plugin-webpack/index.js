const WebpackChain = require('webpack-chain');
const webpackMerge = require('webpack-merge');
const WebpackMetricsPlugin = require('./webpack-metrics-plugin');

const webpackDefaults = {
  //
  // Exclude any modules from webpack bundling that are utilized server-side
  //
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};

/**
* Creates the webpack config
* @param  {Gasket} gasket The Gasket API
* @param {Object} webpackConfig Initial webpack config
* @param {Object} data Additional info
* @returns {Object} Final webpack config
*/
function initWebpack(gasket, webpackConfig, data) {
  const { execSync, config } = gasket;

  const chain = new WebpackChain();
  execSync('webpackChain', chain, data);

  //
  // Merge defaults with gasket.config webpack.
  //
  webpackConfig = webpackMerge.smart(
    webpackConfig,
    { plugins: [new WebpackMetricsPlugin({ gasket })] },
    webpackDefaults,      // Defaults above
    chain.toConfig(),     // Webpack chain from plugins (partial)
    config.webpack || {}  // Webpack config from user (partial)
  );

  const configs = execSync('webpack', webpackConfig, data).filter(Boolean);

  return webpackMerge.smart(webpackConfig, ...configs);
}

module.exports = {
  name: require('./package').name,
  hooks: {
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
