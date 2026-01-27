/// <reference types="@gasket/plugin-metadata" />

import configure from './configure.js';
import build from './build.js';
import actions from './actions.js';
import express from './express.js';
import webpackConfig from './webpack-config.js';
import fastify from './fastify.js';
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
    build,
    express,
    fastify,
    webpackConfig,
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'getSWRegisterScript',
            description: 'Get the service worker registration script',
            link: 'README.md#getSWRegisterScript'
          }
        ],
        lifecycles: [
          {
            name: 'composeServiceWorker',
            method: 'execWaterfall',
            description: 'Update the service worker script',
            link: 'README.md#composeServiceWorker',
            parent: 'express'
          },
          {
            name: 'serviceWorkerCacheKey',
            method: 'exec',
            description: 'Get cache keys for request based service workers',
            link: 'README.md#serviceWorkerCacheKey',
            parent: 'express'
          }
        ],
        configurations: [
          {
            name: 'serviceWorker',
            link: 'README.md#configuration',
            description: 'Service worker plugin config object',
            type: 'object'
          },
          {
            name: 'serviceWorker.url',
            link: 'README.md#configuration',
            description: 'Name of the service worker file',
            type: 'string',
            default: '/sw.js'
          },
          {
            name: 'serviceWorker.scope',
            link: 'README.md#configuration',
            description: 'From where to intercept requests',
            type: 'string',
            default: '/'
          },
          {
            name: 'serviceWorker.content',
            link: 'README.md#configuration',
            description: 'The JavaScript content to be served',
            type: 'string'
          },
          {
            name: 'serviceWorker.cacheKeys',
            link: 'README.md#configuration',
            description:
              'Optional cache key functions that accept the request object as argument and return a string',
            type: 'function[]'
          },
          {
            name: 'serviceWorker.cache',
            link: 'README.md#configuration',
            description:
              'Adjust the content cache settings using the lru-cache options',
            type: 'object'
          },
          {
            name: 'serviceWorker.minify',
            link: 'README.md#configuration',
            description:
              'Minification options to be used on the composed JavaScript',
            type: 'object'
          },
          {
            name: 'serviceWorker.webpackRegister',
            link: 'README.md#configuration',
            description:
              'By default, a service worker registration script will be injected to the webpack entry modules',
            type: 'string | string[] | function | boolean'
          },
          {
            name: 'serviceWorker.staticOutput',
            link: 'README.md#configuration',
            description:
              'If `true`, a static `sw.js` will be output to the `./public` dir',
            type: 'string | boolean',
            default: false
          }
        ]
      };
    }
  }
};

export default plugin;
