const path = require('path');

const moduleDefaults = {
  localesDir: 'locales',
  excludes: ['cacache', 'yargs', 'axe-core']
};

/**
 * @typedef {object} IntlConfig
 *
 * @property {string} basePath - basePath
 * @property {string} localesPath - localesPath
 * @property {string} defaultLocale - defaultLocale
 * @property {string} localesMap - localesMap
 * @property {string} localesDir - fullLocalesDir
 * @property {string} manifestFilename - manifestFilename
 * @property {object} modules - modules
 * @property {string} modules.localesDir - Lookup dir for module files
 * @property {string[]} modules.excludes - List of modules to ignore
 */

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
 * Sets up the Intl config for the Gasket session and add process env variables
 * to access to certain config results where gasket.config is not accessible.
 *
 * @param {Gasket} gasket - Gasket API
 * @param {object} config - Incoming config
 * @returns {{intl: IntlConfig}} config
 */
module.exports = function configureHook(gasket, config) {
  const { logger } = gasket;
  const { root } = config;
  const intlConfig = { ...getIntlConfig({ config }) };

  const { languageMap, defaultLanguage } = intlConfig;
  if (languageMap) logger.warn('DEPRECATED intl config `languageMap` - use `localesMap`');
  if (defaultLanguage) logger.warn('DEPRECATED intl config `defaultLanguage` - use `defaultLocale`');

  // get user defined config and apply defaults
  const {
    localesPath = '/locales',
    defaultLocale = defaultLanguage || 'en-US',
    localesMap = languageMap || {},
    localesDir = './public/locales',
    manifestFilename = 'locales-manifest.json'
  } = intlConfig;

  const fullLocalesDir = path.join(root, localesDir);

  const { next = {} } = config;
  const basePath = intlConfig.basePath || intlConfig.assetPrefix ||
    next.basePath || next.assetPrefix ||
    config.basePath || '';

  let { modules = false } = intlConfig;
  if (modules) {
    modules = modules === true ? moduleDefaults : { ...moduleDefaults, ...modules };
  }

  // This allows packages (@gasket/intl) to reference certain configs
  /* eslint-disable no-process-env */
  process.env.GASKET_INTL_LOCALES_DIR = fullLocalesDir;
  process.env.GASKET_INTL_MANIFEST_FILE = path.join(fullLocalesDir, manifestFilename);
  /* eslint-enable no-process-env */

  return {
    ...config,
    intl: {
      ...intlConfig,
      basePath,
      localesPath,
      defaultLocale,
      localesMap,
      localesDir: fullLocalesDir,
      manifestFilename,
      modules
    }
  };
};

module.exports.getIntlConfig = getIntlConfig;
