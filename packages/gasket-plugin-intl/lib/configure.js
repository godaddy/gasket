/// <reference types="@gasket/plugin-nextjs" />

const path = require('path');

const debug = require('debug')('gasket:plugin:intl:configure');
const { getIntlConfig } = require('./utils/configure-utils');

const moduleDefaults = {
  localesDir: 'locales',
  excludes: ['cacache', 'yargs', 'axe-core']
};

/**
 * Sets up the Intl config for the Gasket session and add process env variables
 * to access to certain config results where gasket.config is not accessible.
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
module.exports = function configure(gasket, config) {
  const { root } = config;
  const intlConfig = { ...getIntlConfig({ config }) };

  // get user defined config and apply defaults
  const {
    localesMap = {},
    defaultLocaleFilePath = 'locales',
    localesDir = 'locales',
    managerFilename = 'intl.js'
  } = intlConfig;

  let {
    locales,
    defaultLocale,
    staticLocaleFilePaths
  } = intlConfig;

  const fullLocalesDir = path.join(root, localesDir);

  if (!locales || !locales.length) {
    locales = ['en-US'];
    gasket.logger.debug(`intl.locales not configured, defaulting to ['en-US']`);
  }

  if (!defaultLocale) {
    defaultLocale = locales[0];
    gasket.logger.debug(`intl.defaultLocale not configured, defaulting to first intl.locales (${defaultLocale})`);
  }

  if (!staticLocaleFilePaths) {
    staticLocaleFilePaths = [defaultLocaleFilePath];
    gasket.logger.debug(`intl.staticLocaleFilePaths not configured, defaulting to [${staticLocaleFilePaths.join(', ')}]`);
  }

  let { modules = false } = intlConfig;
  if (modules && !Array.isArray(modules)) {
    modules =
      modules === true ? moduleDefaults : { ...moduleDefaults, ...modules };
  }

  const normalizedIntlConfig = {
    ...intlConfig,
    defaultLocale,
    locales,
    localesMap,
    defaultLocaleFilePath,
    staticLocaleFilePaths,
    localesDir,
    fullLocalesDir,
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
