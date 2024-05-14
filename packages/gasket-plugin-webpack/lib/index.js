/// <reference types="@gasket/cli" />
/// <reference types="@gasket/plugin-metadata" />

const { name, devDependencies } = require('../package.json');
const initWebpack = require('./init-webpack');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
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
        guides: [
          {
            name: 'Webpack Configuration Guide',
            description: 'Configuring Webpack in Gasket apps',
            link: 'docs/webpack.md'
          }
        ],
        lifecycles: [
          {
            name: 'webpackChain',
            deprecated: true,
            method: 'execApplySync',
            description: 'Setup webpack config by chaining',
            link: 'README.md#webpackChain',
            parent: 'initWebpack'
          },
          {
            name: 'webpack',
            deprecated: true,
            method: 'execApplySync',
            description: 'Modify webpack config with partials or by mutating',
            link: 'README.md#webpack',
            parent: 'initWebpack',
            after: 'webpackChain'
          },
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
  },
  // @ts-ignore - initWebpack is an added property by the webpack plugin
  initWebpack
};

module.exports = plugin;
