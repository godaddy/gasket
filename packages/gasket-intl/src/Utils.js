import { selectLocaleManifestValue } from './LocaleApi';

/**
 * The language codes will fall back in this sequence (da-DK/da used as an example language)
 * da-DK ==> da ==> en-US ==> en ==> null
 *
 * @param {string} language - current language.
 * @returns {string} language - fallback language to use.
 */
export function getFallbackLanguage(language = '') {
  if (language.indexOf('-') > 0) {
    return language.split('-')[0];
  }

  if (language !== 'en') {
    return 'en-US';
  }

  return null;
}

/**
 * Returns a portion of the locale hash that is pertaining to the module/namespace
 *
 * @param {object} manifest - locale manifest data from locales.json file
 * @param {string} module - Name of the module (i.e. @hui/myh-core)
 * @param {string} namespace - Name of a namespace
 * @returns {object} moduleHash - subset of the locale hash.
 */
export function getModuleHashes(manifest, module, namespace) {
  let moduleHashes;
  if (manifest) {
    if (namespace === '') {
      moduleHashes = manifest[module] || {};
    } else {
      moduleHashes = manifest[module] ? manifest[module][namespace] || {} : {};
    }
  }
  return moduleHashes || {};
}

/**
 * Get the language map from gasket.config if available
 *
 * @param {object} state - redux state
 * @returns {object} language map - returns language map from settings if available, otherwise empty object
 */
export function getLanguageMap(state) {
  return (state.intl || {}).languageMap || {};
}

/**
 * Get the default language code from gasket.config if available
 *
 * @param {object} state - redux state
 * @returns {string} default language - returns default language from settings if available, otherwise en-US
 */
export function getDefaultLanguage(state) {
  return (state.intl || {}).defaultLanguage || 'en-US';
}

/**
 * Get the mapped language code based on mapping from gasket.config.
 *
 * @param {object} state - redux state
 * @param {string} language - language
 * @returns {string} mapped language - returns mapped language if a mapping exists, otherwise returns the passed value.
 *
 */
export function getMappedLanguage(state, language) {
  const map = getLanguageMap(state);
  if (language in map && map[language]) {
    return map[language];
  }
  return language;
}

/**
 * Get the applicable/available language
 *
 * @param {object} state - redux state
 * @param {object} manifest - locale manifest data from locales.json file
 * @param {string} language - language
 * @param {string} module - Name of the module (i.e. @hui/myh-core)
 * @param {string} namespace - Name of a namespace
 * @returns {string} language
 */
/* eslint-disable-next-line max-params */
export function getAvailableLanguage(state, manifest, language, module, namespace) {
  const moduleHashes = getModuleHashes(manifest, module, namespace);

  let mappedLanguage = language;
  while (mappedLanguage !== null) {
    mappedLanguage = getMappedLanguage(state, mappedLanguage);
    if (moduleHashes[mappedLanguage]) {
      return mappedLanguage;
    }
    mappedLanguage = getFallbackLanguage(mappedLanguage);
  }

  return getDefaultLanguage(state);
}

/**
 * Checks if module name is not mentioned and returns the correct module name
 *
 * @param {object} manifest - locale manifest data from locales.json file.
 * @param {string} module - single module name
 * @returns {string} Updated module name
 */
export function fixModuleName(manifest, module) {
  if (module === '' || module === 'default') {
    return manifest.__default__;
  }
  return module;
}

/**
 * Get the locale file name to use for the current language with hash if set
 *
 * @param {object} state - redux state
 * @param {object} manifest - locale manifest data from locales.json file
 * @param {string} language - language
 * @param {string} module - Name of the module (i.e. @hui/myh-core)
 * @param {string} namespace - Name of a namespace
 * @returns {string} returns the name to use to get the locale data for this module.
 */
/* eslint-disable-next-line max-params */
export function getLocaleFileName(state, manifest, language, module, namespace) {
  module = fixModuleName(manifest, module);
  const mappedLanguage = getAvailableLanguage(state, manifest, language, module, namespace);
  const moduleHashes = getModuleHashes(manifest, module, namespace);
  const hash = moduleHashes[mappedLanguage];
  return (hash ? `${hash}.${mappedLanguage}` : mappedLanguage) + '.json';
}

/**
 * This function parses module name and returns proper module-name and namespace in a json format
 *
 * @param {string} identifier - identifier from LocaleRequired props.
 * @returns {object} returns a json object with module and namespace information.
 */
export function getIdentifierParts(identifier) {
  if (typeof identifier === 'object') {
    const { module = '', namespace = '' } = identifier;
    return {
      module,
      namespace
    };
  }
  const arr = identifier.split('.');
  const module = arr.shift();
  const namespace = arr.join('.');
  return {
    module,
    namespace
  };
}

/**
 * Select the language from redux state
 *
 * @param {object} state - redux state
 * @returns {string} language
 */
export function selectLanguage(state) {
  return (state.intl && state.intl.language) || getDefaultLanguage(state);
}

/**
 * Build and return an array of params objects for each module to be included.
 *
 * @param {Object} state - redux state
 * @param {Array|String} identifiers - single module name or array of module names
 * @returns {Array} - returns an array of param objects required to get locale files for each identifier.
 */
export function getParamsForIdentifiers(state, identifiers) {
  if (typeof identifiers === 'undefined') {
    identifiers = '';
  }
  identifiers = Array.isArray(identifiers) ? identifiers : [identifiers];
  const language = selectLanguage(state);
  const manifest = selectLocaleManifestValue(state);

  return identifiers.map(identifier => {
    const parts = getIdentifierParts(identifier);
    const { namespace } = parts;
    const module = fixModuleName(manifest, parts.module);
    const modulePath = module + (namespace ? `/${namespace}` : '');
    const localeFile = getLocaleFileName(state, manifest, language, module, namespace);
    return { module: modulePath, localeFile };
  });
}
