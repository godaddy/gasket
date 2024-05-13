/// <reference types="@gasket/plugin-metadata" />

const { name } = require('../package.json');
const middleware = require('./middleware');

// set log configuration in gasket.config.js, under `morgan` key
// configuration options: http://expressjs.com/en/resources/middleware/morgan.html
/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  dependencies: ['@gasket/plugin-log'],
  hooks: {
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'morgan',
            link: 'README.md#configuration',
            description: 'Morgan plugin configuration',
            type: 'object'
          },
          {
            name: 'morgan.format',
            link: 'README.md#configuration',
            description: 'Log format to print',
            type: 'string',
            default: 'tiny'
          },
          {
            name: 'morgan.options',
            link: 'README.md#configuration',
            description: 'Morgan options',
            type: 'object'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
