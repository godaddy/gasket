/// <reference types="@gasket/plugin-metadata" />

import webpackConfig from './webpack-config.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;
/**
 * Gasket Analyzer Plugin
 * @type {import('@gasket/core').Plugin}
 */
const plugin = {
  name,
  version,
  description,
  hooks: {
    webpackConfig,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'bundleAnalyzerConfig',
            link: 'README.md#configuration',
            description:
              'Tune both browser and server Webpack analysis reports',
            type: 'object'
          }
        ]
      };
    }
  }
};

export default plugin;
