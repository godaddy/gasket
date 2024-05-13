/// <reference types="@gasket/plugin-metadata" />

const { name } = require('../package.json');
const configure = require('./configure');
const init = require('./init');
const middleware = require('./middleware');
const serve = require('./serve');
const serviceWorkerCacheKey = require('./service-worker-cache-key');
const apmTransaction = require('./apm-transaction');
const workbox = require('./workbox');

const { getIntlConfig } = require('./configure');
const create = require('./create');
const build = require('./build');
const webpackConfig = require('./webpack-config');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  dependencies: ['@gasket/plugin-log'],
  name,
  hooks: {
    init,
    configure,
    create,
    build,
    webpackConfig,
    express: serve,
    fastify: serve,
    middleware,
    apmTransaction,
    workbox,
    serviceWorkerCacheKey,
    metadata(gasket, meta) {
      const { localesDir } = getIntlConfig(gasket);
      return {
        ...meta,
        lifecycles: [
          {
            name: 'intlLocale',
            method: 'execWaterfall',
            description: 'Set the language for which locale files to load',
            link: 'README.md#intlLocale',
            parent: 'middleware'
          }
        ],
        structures: [
          {
            name: localesDir + '/',
            description: 'Locale JSON files with translation strings',
            link: 'README.md#Options'
          }
        ],
        configurations: [
          {
            name: 'intl',
            link: 'README.md#configuration',
            description: 'Intl config object',
            type: 'object'
          },
          {
            name: 'intl.basePath',
            link: 'README.md#configuration',
            description: 'Base URL where locale files are served',
            type: 'string'
          },
          {
            name: 'intl.defaultPath',
            link: 'README.md#configuration',
            description: 'Path to endpoint with JSON files',
            default: '/locales',
            type: 'string'
          },
          {
            name: 'intl.localesPath',
            link: 'README.md#locals-path',
            description: 'URL endpoint where static JSON files are available',
            type: 'string'
          },
          {
            name: 'intl.defaultLocale',
            link: 'README.md#configuration',
            description: 'Locale to fallback to when loading files',
            type: 'string',
            default: 'en'
          },
          {
            name: 'intl.locales',
            link: 'README.md#configuration',
            description: 'Ordered list of accepted locales',
            type: 'string[]'
          },
          {
            name: 'intl.localesMap',
            link: 'README.md#configuration',
            description: 'Mapping of locales to share files',
            type: 'object'
          },
          {
            name: 'intl.localesDir',
            link: 'README.md#configuration',
            description: 'Path to on-disk directory where locale files exists',
            type: 'string',
            default: './public/locales'
          },
          {
            name: 'intl.manifestFilename',
            link: 'README.md#configuration',
            description: 'Change the name of the manifest file',
            type: 'string',
            default: 'locales-manifest.json'
          },
          {
            name: 'intl.serveStatic',
            link: 'README.md#configuration',
            description: 'Enables ability to serve static locale files',
            type: 'boolean | string',
            default: 'locales-manifest.json'
          },
          {
            name: 'intl.modules',
            link: 'README.md#configuration',
            description: 'Enable locale files collation from node modules',
            type: 'boolean | object'
          },
          {
            name: 'intl.nextRouting',
            link: 'README.md#configuration',
            description:
              'Enable Next.js Routing when used with @gasket/plugin-nextjs',
            type: 'boolean',
            default: 'true'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
