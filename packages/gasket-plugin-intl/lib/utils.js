const path = require('path');
const fs = require('fs');
const defaultConfig = require('./default-config');

function getIntlConfig(gasket) {
  const { intl: intlConfig = {} } = gasket.config || {};
  return { ...defaultConfig, ...intlConfig };
}

function getAssetPrefix(gasket) {
  const { next = {}, intl = {}, zone } = gasket.config;
  return intl.assetPrefix || next.assetPrefix || zone || '';
}

function getIntlLanguageMap(gasket) {
  return (gasket.config.intl || {}).languageMap || {};
}

function getDefaultLanguage(gasket) {
  return (gasket.config.intl || {}).defaultLanguage || 'en-US';
}

function getOutputDir(gasket) {
  const { root } = gasket.config;
  const { outputDir } = getIntlConfig(gasket);
  return path.join(root, outputDir);
}

/**
 * The language codes will fall back in this sequence
 * (da-DK/da used as an example language)
 * da-DK ==> da ==> en-US ==> en ==> null
 *
 * @param {string} language - current language.
 * @returns {string} language - fallback language to use.
 */
function getFallbackLanguage(language = '') {
  if (language.indexOf('-') > 0) {
    return language.split('-')[0];
  }

  if (language !== 'en') {
    return 'en-US';
  }

  return null;
}

/**
 * Get the mapped language code based on mapping from gasket.config.
 * Returns mapped language if a mapping exists, otherwise returns original.
 *
 * @param {Gasket} gasket - Gasket config
 * @param {string} language - language
 * @returns {string} mapped language
 */
function getMappedLanguage(gasket, language) {
  const map = getIntlLanguageMap(gasket);
  if (language in map && map[language]) {
    return map[language];
  }
  return language;
}

let __manifest;
/**
 * Loads manifest file once, synchronously, returns loaded manifest for
 * subsequent calls.
 *
 * @param {string} outputDir - where to load locale manifest from
 * @returns {Promise<Object>} manifest
 */
function loadLocalesManifest(outputDir) {
  if (!__manifest) {
    // eslint-disable-next-line no-sync
    const data = fs.readFileSync(path.join(outputDir, 'locales-manifest.json'), 'utf8');
    __manifest = JSON.parse(data);
  }
  return __manifest;
}
loadLocalesManifest.__manifest = __manifest;


function getAvailableLanguages(localesManifest) {
  const languages = new Set();

  const getLanguages = obj => Object.entries(obj).
    forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (key !== '__default__') {
          languages.add(key);
        }
      } else if (value) {
        getLanguages(value);
      }
    });

  getLanguages(localesManifest);

  return languages;
}

/**
 * Creates a getLanguage from gasket config to handle mapping,
 * and fallback complexities.
 *
 * @param {Gasket} gasket - Gasket
 * @returns {getLanguage} getLanguage
 */
function createGetLanguage(gasket) {
  const defaultLanguage = getDefaultLanguage(gasket);
  const localesManifest = loadLocalesManifest(getOutputDir(gasket));
  const availableLanguages = getAvailableLanguages(localesManifest);
  /**
   * Derive the language from request headers and use mapping and fallback to
   * get the an appropriate supported language
   *
   * @typedef {Function} getLanguage
   *
   * @param {Request} req - Request object
   * @returns {string} lang
   */
  return function getLanguage(req) {
    const { store } = req;
    const language = store.getState().intl.language;

    let mappedLanguage = language;
    while (mappedLanguage !== null) {
      mappedLanguage = getMappedLanguage(gasket, mappedLanguage);
      if (availableLanguages.has(mappedLanguage)) {
        return mappedLanguage;
      }
      mappedLanguage = getFallbackLanguage(mappedLanguage);
    }

    return defaultLanguage;
  };
}

module.exports = {
  getIntlConfig,
  getAssetPrefix,
  getIntlLanguageMap,
  getDefaultLanguage,
  getOutputDir,
  getFallbackLanguage,
  getMappedLanguage,
  loadLocalesManifest,
  getAvailableLanguages,
  createGetLanguage
};
