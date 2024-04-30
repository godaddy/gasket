/// <reference types="@gasket/cli" />
/// <reference types="@gasket/plugin-metadata" />

const middleware = require('./middleware');
const preboot = require('./preboot');
const configure = require('./configure');
const { devDependencies, name } = require('../package.json');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
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
          'elastic-apm-node': devDependencies['elastic-apm-node'],
          'dotenv': devDependencies.dotenv
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
