/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

import actions from './actions.js';
import packageJson from '../package.json' with { type: 'json' };
const {
  name,
  version,
  description
} = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'getWebpackConfig',
            description: 'Get the webpack config',
            link: 'README.md#getWebpackConfig'
          }
        ],
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
            description: 'Transform the Webpack config',
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

export default plugin;
