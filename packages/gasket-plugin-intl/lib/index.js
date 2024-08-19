/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-metadata" />

const { name, version, description } = require('../package.json');
const actions = require('./actions');
const configure = require('./configure');
const init = require('./init');
const serviceWorkerCacheKey = require('./service-worker-cache-key');
const apmTransaction = require('./apm-transaction');
const publicGasketData = require('./public-gasket-data');

const { getIntlConfig } = require('./configure');
const create = require('./create');
const postCreate = require('./post-create');
const prompt = require('./prompt');
const build = require('./build');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    init,
    configure,
    create,
    postCreate,
    prompt,
    build,
    apmTransaction,
    publicGasketData,
    serviceWorkerCacheKey,
    metadata(gasket, meta) {
      const { localesDir } = getIntlConfig(gasket);
      return {
        ...meta,
        lifecycles: [
          {
            name: 'intlLocale',
            method: 'execWaterfallSync',
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
            name: 'intl.defaultLocaleFilePath',
            link: 'README.md#configuration',
            description: 'Lookup path to locale files',
            default: 'locales',
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
            default: './locales'
          },
          {
            name: 'intl.managerFilename',
            link: 'README.md#configuration',
            description: 'Change the name of the IntlManager file',
            type: 'string',
            default: 'intl.js'
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
