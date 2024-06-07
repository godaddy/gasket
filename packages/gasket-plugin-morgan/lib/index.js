/// <reference types="@gasket/plugin-metadata" />

const { name, version, description } = require('../package.json');
const middleware = require('./middleware');

// set log configuration in gasket.config.js, under `morgan` key
// configuration options: http://expressjs.com/en/resources/middleware/morgan.html
/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
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
