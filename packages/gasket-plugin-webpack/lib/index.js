const { name, version, devDependencies } = require('../package');
const initWebpack = require('./init-webpack');

module.exports = {
  name,
  hooks: {
    create(gasket, { pkg, gasketConfig }) {
      gasketConfig.addPlugin('pluginWebpack', name);
      pkg.add('dependencies', {
        [name]: `^${version}`
      });
      pkg.add('devDependencies', {
        webpack: devDependencies.webpack
      });
    },
    actions(gasket) {
      return {
        getWebpackConfig(config, context) {
          return initWebpack(gasket, config, context);
        }
      };
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
          deprecated: true,
          method: 'execSync',
          description: 'Setup webpack config by chaining',
          link: 'README.md#webpackChain',
          parent: 'initWebpack'
        }, {
          name: 'webpack',
          deprecated: true,
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
  }
};
