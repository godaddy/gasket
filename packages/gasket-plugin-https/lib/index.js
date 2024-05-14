/// <reference types="@gasket/plugin-start" />
/// <reference types="@gasket/plugin-metadata" />

const { name } = require('../package.json');
const start = require('./start');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    start,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'createServers',
            method: 'execWaterfall',
            description: 'Setup the `create-servers` options',
            link: 'README.md#createServers',
            parent: 'start'
          },
          {
            name: 'terminus',
            method: 'execWaterfall',
            description: 'Setup the `terminus` options',
            link: 'README.md#terminus',
            parent: 'start',
            after: 'createServers'
          },
          {
            name: 'servers',
            method: 'exec',
            description: 'Access to the server instances',
            link: 'README.md#servers',
            parent: 'start',
            after: 'terminus'
          }
        ],
        configurations: [
          {
            name: 'http',
            link: 'README.md#configuration',
            description: 'HTTP port or config object',
            type: 'number | object'
          },
          {
            name: 'https',
            link: 'README.md#configuration',
            description: 'HTTPS config object',
            type: 'object'
          },
          {
            name: 'http2',
            link: 'README.md#configuration',
            description: 'HTTP2 config object',
            type: 'object'
          },
          {
            name: 'terminus',
            link: 'README.md#configuration',
            description: 'Terminus config object',
            type: 'object'
          },
          {
            name: 'terminus.healthcheck',
            link: 'README.md#configuration',
            description: 'Custom Terminus healthcheck endpoint names',
            default: ['/healthcheck', '/healthcheck.html'],
            type: 'string[]'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
