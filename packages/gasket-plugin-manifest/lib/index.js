/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@gasket/plugin-metadata" />

import build from './build.js';
import configure from './configure.js';
import serve from './serve.js';
import middleware from './middleware.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
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

export default plugin;
