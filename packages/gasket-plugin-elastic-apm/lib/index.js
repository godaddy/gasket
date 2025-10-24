/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

import * as actions from './actions.js';
import create from './create.js';
import configure from './configure.js';
import { readFileSync } from 'fs';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version, description } = pkg;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    create,
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
            parent: 'middleware'
          }
        ]
      };
    }
  }
};

export default plugin;
