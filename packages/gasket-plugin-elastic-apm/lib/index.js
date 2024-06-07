/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

const middleware = require('./middleware');
const preboot = require('./preboot');
const configure = require('./configure');
const {
  name,
  version,
  description,
  devDependencies
 } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    configure,
    preboot,
    create: {
      timing: {
        after: ['@gasket/plugin-start']
      },
      handler(gasket, { pkg, files }) {
        const generatorDir = `${__dirname}/../generator`;

        pkg.add('dependencies', {
          'elastic-apm-node': devDependencies['elastic-apm-node']
        });
        pkg.add('scripts', {
          start: 'gasket start --require ./setup.js'
        });

        files.add(`${generatorDir}/*`);
      }
    },
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
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
