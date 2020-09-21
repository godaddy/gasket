const manifest = require(process.env.GASKET_INTL_MANIFEST_FILE);

export const isServer = typeof window === 'undefined';

/**
 * The locale codes will fall back in this sequence (da-DK/da used as an example locale)
 * da-DK ==> da ==> en-US ==> en ==> null
 *
 * @param {string} locale - current locale.
 * @returns {string} locale - fallback locale to use.
 */
export function getFallbackLocale(locale = '') {
  if (locale.indexOf('-') > 0) {
    return locale.split('-')[0];
  }

  if (locale !== 'en') {
    return 'en-US';
  }

  return null;
}

/**
 * Returns the file hashes pertaining to the module/namespace
 *
 * @param {string} module - Name of the module (i.e. @hui/myh-core)
 * @param {string} namespace - Name of a namespace
 * @returns {object} moduleHash - subset of the locale hash.
 */
export function getModuleHashes(module, namespace) {
  const { moduleHashes } = manifest;
  let results;
  if (manifest) {
    if (namespace === '') {
      results = moduleHashes[module] || {};
    } else {
      results = moduleHashes[module] ? moduleHashes[module][namespace] || {} : {};
    }
  }
  return results || {};
}

/**
 * Get the mapped locale code based on mapping from gasket.config.
 *
 * @param {string} locale - locale
 * @returns {string} mapped locale - returns mapped locale if a mapping exists, otherwise returns the passed value.
 */
export function getMappedLocale(locale) {
  const { localeMap = {} } = manifest;
  if (locale in localeMap && localeMap[locale]) {
    return localeMap[locale];
  }
  return locale;
}

/**
 * Get the applicable/available locale
 *
 * @param {string} locale - locale
 * @param {string} module - Name of the module (i.e. @hui/myh-core)
 * @param {string} namespace - Name of a namespace
 * @returns {string} locale
 */
export function getAvailableLocale(locale, module, namespace) {
  const moduleHashes = getModuleHashes(module, namespace);

  let mappedLocale = locale;
  while (mappedLocale !== null) {
    mappedLocale = getMappedLocale(mappedLocale);
    if (moduleHashes[mappedLocale]) {
      return mappedLocale;
    }
    mappedLocale = getFallbackLocale(mappedLocale);
  }
  return manifest.defaultLocale;
}

/**
 * Checks if module name is not mentioned and returns the correct module name
 *
 * @param {string} module - single module name
 * @returns {string} Updated module name
 */
export function fixModuleName(module) {
  if (module === '' || module === 'default') {
    return manifest.defaultModule;
  }
  return module;
}

/**
 * Get the locale file name to use for the current locale with hash if set
 *
 * @param {object} state - redux state
 * @param {object} manifest - locale manifest data from locales.json file
 * @param {string} locale - locale
 * @param {string} module - Name of the module (i.e. @hui/myh-core)
 * @param {string} namespace - Name of a namespace
 * @returns {string} returns the name to use to get the locale data for this module.
 */
/* eslint-disable-next-line max-params */
export function getLocaleFileName(locale, module, namespace) {
  module = fixModuleName(module);
  const mappedLocale = getAvailableLocale(locale, module, namespace);
  const moduleHashes = getModuleHashes(module, namespace);
  const hash = moduleHashes[mappedLocale];
  return (hash ? `${hash}.${mappedLocale}` : mappedLocale) + '.json';
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
 * Build and return an array of params objects for each module to be included.
 *
 * @param {string} locale - Locale to look up
 * @param {Array|String} identifiers - single module name or array of module names
 * @returns {Array} - returns an array of param objects required to get locale files for each identifier.
 */
export function getParamsForIdentifiers(locale, identifiers) {
  if (typeof identifiers === 'undefined') {
    identifiers = '';
  }
  identifiers = Array.isArray(identifiers) ? identifiers : [identifiers];
  return identifiers.map(identifier => {
    const parts = getIdentifierParts(identifier);
    const { namespace } = parts;
    const module = fixModuleName(parts.module);
    const modulePath = module + (namespace ? `/${namespace}` : '');
    const localeFile = getLocaleFileName(locale, module, namespace);
    return { module: modulePath, localeFile };
  });
}
