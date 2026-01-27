/// <reference types="@gasket/plugin-metadata" />

import packageJson from '../package.json' with { type: 'json' };
import actions from './actions.js';
import configure from './configure.js';
import init from './init.js';
import serviceWorkerCacheKey from './service-worker-cache-key.js';
import apmTransaction from './apm-transaction.js';
import publicGasketData from './public-gasket-data.js';
import { getIntlConfig } from './utils/configure-utils.js';
import build from './build.js';
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    init,
    configure,
    build,
    apmTransaction,
    publicGasketData,
    serviceWorkerCacheKey,
    metadata(gasket, meta) {
      const { localesDir } = getIntlConfig(gasket);
      return {
        ...meta,
        actions: [
          {
            name: 'getIntlLocale',
            description: 'Get the current locale',
            link: 'README.md#getIntlLocale'
          },
          {
            name: 'getIntlManager',
            description: 'Get the IntlManager instance',
            link: 'README.md#getIntlManager'
          }
        ],
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

export default plugin;
