/// <reference types="@gasket/plugin-metadata" />

import create from './create.js';
import webpackConfig from './webpack-config.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');
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
    create,
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
