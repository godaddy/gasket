/// <reference types="@gasket/plugin-metadata" />

import * as actions from './actions.js';
import configure from './configure.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'getApmTransaction',
            description: 'Get the APM transaction data',
            link: 'README.md#getApmTransaction'
          }
        ],
        configurations: [
          {
            name: 'elasticAPM',
            link: 'README.md#configuration',
            description: 'Configuration to provide additional setup helpers',
            type: 'object'
          },
          {
            name: 'elasticAPM.sensitiveCookies',
            link: 'README.md#configuration',
            description: 'List of sensitive cookies to filter',
            type: 'string[]',
            default: '[]'
          }
        ],
        lifecycles: [
          {
            name: 'apmTransaction',
            method: 'exec',
            description: 'Modify the APM transaction',
            link: 'README.md#apmtransaction',
            parent: 'express'
          }
        ]
      };
    }
  }
};

export default plugin;
