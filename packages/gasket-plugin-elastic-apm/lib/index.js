/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

const actions = require('./actions');
const create = require('./create');
const configure = require('./configure');
const {
  name,
  version,
  description
} = require('../package.json');

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

module.exports = plugin;
