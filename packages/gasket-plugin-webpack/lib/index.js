/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

const {
  name,
  version,
  description,
  devDependencies
} = require('../package.json');
const initWebpack = require('./init-webpack');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
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
        guides: [
          {
            name: 'Webpack Configuration Guide',
            description: 'Configuring Webpack in Gasket apps',
            link: 'docs/webpack.md'
          }
        ],
        lifecycles: [
          {
            name: 'webpackConfig',
            method: 'execApplySync',
            description:
              'Transform the webpack config, with the help of webpack-merge',
            link: 'README.md#webpackConfig',
            parent: 'initWebpack',
            after: 'webpack'
          },
          {
            name: 'initWebpack',
            description: 'Create a webpack config',
            command: 'build',
            link: 'README.md#initwebpack'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
