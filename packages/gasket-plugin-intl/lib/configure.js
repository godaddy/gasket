/// <reference types="@gasket/plugin-nextjs" />

const path = require('path');

const debug = require('debug')('gasket:plugin:intl:configure');

const moduleDefaults = {
  localesDir: 'locales',
  excludes: ['cacache', 'yargs', 'axe-core']
};

const isDefined = (o) => typeof o !== 'undefined';

/**
 * Shortcut to get the gasket.config.intl object
 * @param {import("@gasket/core").Gasket} gasket - Gasket API
 * @returns {import('./index').IntlConfig} intl config
 */
function getIntlConfig(gasket) {
  const { intl = {} } = gasket.config || {};

  // handling default here is necessary for metadata which runs before configure
  // hook
  intl.localesDir = intl.localesDir || path.join('public', 'locales');
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

  const { nextConfig = {} } = config;

  // get user defined config and apply defaults
  const {
    defaultPath = '/locales',
    defaultLocale = 'en',
    localesMap = {},
    localesDir,
    manifestFilename = 'locales-manifest.json',
    preloadLocales = false
  } = intlConfig;

  const fullLocalesDir = path.join(root, localesDir);

  const basePath = [
    intlConfig.basePath,
    nextConfig.assetPrefix,
    nextConfig.basePath,
    config.basePath,
    ''
  ].find(isDefined);

  let { modules = false } = intlConfig;
  if (modules && !Array.isArray(modules)) {
    modules =
      modules === true ? moduleDefaults : { ...moduleDefaults, ...modules };
  }

  /* eslint-disable no-process-env */

  // Allows @gasket/react-intl/next to perform server side loading
  Object.assign(process.env, {
    GASKET_INTL_LOCALES_DIR: fullLocalesDir,
  });

  // Allows @gasket/react-intl to access manifest, and is bundled for browser
  Object.assign(process.env, {
    GASKET_INTL_MANIFEST_FILE: path.join(fullLocalesDir, manifestFilename)
  });

  /* eslint-enable no-process-env */
  const normalizedIntlConfig = {
    ...intlConfig,
    basePath,
    defaultPath,
    defaultLocale,
    localesMap,
    localesDir: fullLocalesDir,
    manifestFilename,
    preloadLocales,
    modules
  };

  debug(`Normalized intl config: ${JSON.stringify(normalizedIntlConfig)}`);

  /**
   * @typedef {object} IntlConfig
   * @property {string} basePath - Base URL where locale files are served
   * @property {string} defaultPath - Path to endpoint with JSON files
   * @property {string} defaultLocale - Locale to fallback to when loading files
   * @property {object} localesMap - Mapping of locales to share files
   * @property {string} localesDir - Path to on-disk directory where locale
   * files exists
   * @property {string} manifestFilename - Name of the manifest file
   * @property {boolean} preloadLocales - Preloads locale files if set to true
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
