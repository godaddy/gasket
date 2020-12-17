const path = require('path');

const moduleDefaults = {
  localesDir: 'locales',
  excludes: ['cacache', 'yargs', 'axe-core']
};

/**
 * Shortcut to get the gasket.config.intl object
 *
 * @param {Gasket} gasket - Gasket API
 * @returns {IntlConfig} intlConfig
 */
function getIntlConfig(gasket) {
  const { intl = {} } = gasket.config || {};
  return intl;
}

/**
 * Destructure deprecated options as fallbacks and log warnings if used.
 *
 * @param {Gasket} gasket - Gasket API
 * @param {object} intlConfig - User intl config
 * @returns {object} config
 */
function deprecatedOptions(gasket, intlConfig) {
  const { logger } = gasket;
  const { languageMap, defaultLanguage, assetPrefix } = intlConfig;
  if (languageMap) logger.warning('DEPRECATED intl config `languageMap` - use `localesMap`');
  if (defaultLanguage) logger.warning('DEPRECATED intl config `defaultLanguage` - use `defaultLocale`');
  if (assetPrefix) logger.warning('DEPRECATED intl config `assetPrefix` - use `basePath`');
  return { languageMap, defaultLanguage, assetPrefix };
}

/**
 * Sets up the Intl config for the Gasket session and add process env variables
 * to access to certain config results where gasket.config is not accessible.
 *
 * @param {Gasket} gasket - Gasket API
 * @param {object} config - Incoming config
 * @returns {{intl: IntlConfig}} config
 */
module.exports = function configureHook(gasket, config) {
  const { root } = config;
  const intlConfig = { ...getIntlConfig({ config }) };

  const { languageMap, defaultLanguage, assetPrefix } = deprecatedOptions(gasket, intlConfig);
  const { nextConfig = {} } = config;

  // get user defined config and apply defaults
  const {
    defaultPath = '/locales',
    defaultLocale = defaultLanguage || 'en',
    localesMap = languageMap || {},
    localesDir = './public/locales',
    manifestFilename = 'locales-manifest.json'
  } = intlConfig;

  const fullLocalesDir = path.join(root, localesDir);

  const basePath = intlConfig.basePath || assetPrefix ||
    nextConfig.basePath || nextConfig.assetPrefix ||
    config.basePath || '';

  let { modules = false } = intlConfig;
  if (modules) {
    modules = modules === true ? moduleDefaults : { ...moduleDefaults, ...modules };
  }

  // This allows packages (@gasket/react-intl) to reference certain configs
  /* eslint-disable no-process-env */
  process.env.GASKET_INTL_LOCALES_DIR = fullLocalesDir;
  process.env.GASKET_INTL_MANIFEST_FILE = path.join(fullLocalesDir, manifestFilename);
  /* eslint-enable no-process-env */

  /**
   * @typedef {object} IntlConfig
   *
   * @property {string} basePath - Base URL where locale files are served
   * @property {string} defaultPath - Path to endpoint with JSON files
   * @property {string} defaultLocale - Locale to fallback to when loading files
   * @property {object} localesMap - Mapping of locales to share files
   * @property {string} localesDir - Path to on-disk directory where locale files exists
   * @property {string} manifestFilename - Name of the manifest file
   * @property {object} modules - Enable locale files collation from node modules
   * @property {string} modules.localesDir - Lookup dir for module files
   * @property {string[]} modules.excludes - List of modules to ignore
   */
  return {
    ...config,
    intl: {
      ...intlConfig,
      basePath,
      defaultPath,
      defaultLocale,
      localesMap,
      localesDir: fullLocalesDir,
      manifestFilename,
      modules
    }
  };
};

module.exports.getIntlConfig = getIntlConfig;
