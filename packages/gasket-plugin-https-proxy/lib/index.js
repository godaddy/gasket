/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

import create from './create.js';
import { actions } from './actions.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  description,
  actions,
  hooks: {
    create,
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'startProxyServer',
            description: 'Start the proxy server',
            link: 'README.md#startProxyServer'
          }
        ],
        lifecycles: [
          {
            name: 'httpsProxy',
            method: 'execWaterfall',
            description: 'Setup the httpsProxy options',
            link: 'README.md#httpsProxy'
          }
        ],
        configurations: [
          {
            name: 'httpsProxy',
            link: 'README.md#configuration',
            description: 'http-proxy config object',
            type: 'object'
          }
        ]
      };
    }
  }
};