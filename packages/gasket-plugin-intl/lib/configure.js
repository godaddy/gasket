/// <reference types="@gasket/plugin-nextjs" />

const path = require('path');

const debug = require('debug')('gasket:plugin:intl:configure');

const moduleDefaults = {
  localesDir: 'locales',
  excludes: ['cacache', 'yargs', 'axe-core']
};

/**
 * Shortcut to get the gasket.config.intl object
 * @param {import("@gasket/core").Gasket} gasket - Gasket API
 * @returns {import('./index').IntlConfig} intl config
 */
function getIntlConfig(gasket) {
  const { intl = {} } = gasket.config || {};

  // handling default here is necessary for metadata which runs before configure hook
  intl.localesDir ??= 'locales';
  return intl;
}

/**
 * Sets up the Intl config for the Gasket session and add process env variables
 * to access to certain config results where gasket.config is not accessible.
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
module.exports = function configure(gasket, config) {
  const { root } = config;
  // @ts-ignore - temp fix until we can get types for gasket-plugin-intl
  const intlConfig = { ...getIntlConfig({ config }) };

  // get user defined config and apply defaults
  const {
    defaultLocaleFilePath = 'locales',
    defaultLocale = 'en',
    localesMap = {},
    localesDir,
    managerFilename = 'intl.js'
  } = intlConfig;

  const fullLocalesDir = path.join(root, localesDir);

  let { modules = false } = intlConfig;
  if (modules && !Array.isArray(modules)) {
    modules =
      modules === true ? moduleDefaults : { ...moduleDefaults, ...modules };
  }

  const normalizedIntlConfig = {
    ...intlConfig,
    defaultLocaleFilePath,
    defaultLocale,
    localesMap,
    localesDir: fullLocalesDir,
    managerFilename,
    modules
  };

  debug(`Normalized intl config: ${JSON.stringify(normalizedIntlConfig)}`);

  /**
   * @typedef {object} IntlConfig
   * @property {string} defaultLocaleFilePath - Path to endpoint with JSON files
   * @property {string} defaultLocale - Locale to fallback to when loading files
   * @property {object} localesMap - Mapping of locales to share files
   * @property {string} localesDir - Path to on-disk directory where locale
   * files exists
   * @property {string} managerFilename - Name of the manager file
   * @property {object} modules - Enable locale files collation from node
   * modules
   * @property {string} modules.localesDir - Lookup dir for module files
   * @property {string[]} modules.excludes - List of modules to ignore
   */
  return {
    ...config,
    intl: normalizedIntlConfig
  };
};

// @ts-ignore
module.exports.getIntlConfig = getIntlConfig;
