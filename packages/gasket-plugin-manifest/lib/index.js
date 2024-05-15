/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@gasket/plugin-metadata" />

const build = require('./build');
const configure = require('./configure');
const serve = require('./serve');
const middleware = require('./middleware');
const { name } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  hooks: {
    build,
    configure,
    express: serve,
    fastify: serve,
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'manifest',
            method: 'execWaterfall',
            description: 'Modify the the web manifest for a request',
            link: 'README.md#manifest',
            parent: 'middleware'
          }
        ],
        configurations: [
          {
            name: 'manifest',
            link: 'README.md#configuration',
            description: 'Manifest plugin config',
            type: 'object'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
