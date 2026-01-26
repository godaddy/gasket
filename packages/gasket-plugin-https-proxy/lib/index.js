/// <reference types="@gasket/plugin-metadata" />

import { actions } from './actions.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
export default {
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
            name: 'startProxyServer',
            description: 'Start the proxy server',
            link: 'README.md#startProxyServer'
          }
        ],
        lifecycles: [
          {
            name: 'prebootHttpsProxy',
            description: 'Executed before the proxy server is started.',
            link: 'README.md#prebootHttpsProxy'
          },
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
