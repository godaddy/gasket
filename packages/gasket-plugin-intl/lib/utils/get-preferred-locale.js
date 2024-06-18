const debug = require('debug')('gasket:plugin:intl:utils');
const accept = require('@hapi/accept');
const { getIntlConfig } = require('../configure');

/**
 * Capitalize the first letter of a string.
 * @param {string} str - String to capitalize
 * @returns {string} capitalized string
 */
function capitalize(str) {
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}

/**
 * Ensure consistent locale format coming from accept-language header.
 * @example
 * - az-AZ
 * - az-Arab
 * - az-AZ-Latn
 * @type {import('../internal').formatLocale}
 */
function formatLocale(language) {
  const [lang, ...rest] = language ? language.split('-') : [];
  return [
    lang.toLowerCase(),
    ...rest.map((o) => (o.length === 2 ? o.toUpperCase() : capitalize(o)))
  ].join('-');
}

/**
 * Get the preferred locale from the request headers.
 * @type {import('../internal').getLocaleFromHeaders}
 */
function getLocaleFromHeaders(gasket, req, locales, defaultLocale) {
  let preferredLocale = defaultLocale;
  /** @type {string} */
  const acceptLanguage = req.headers['accept-language'];

  if (acceptLanguage) {
    debug(`Received accept-language of ${acceptLanguage}`);
    try {
      // Get highest or highest from locales if configured
      preferredLocale = formatLocale(accept.language(acceptLanguage, locales));
      debug(`Using ${preferredLocale} as starting locale`);
    } catch (error) {
      gasket.logger.debug(
        `Unable to parse accept-language header: ${error.message}`
      );
    }
  } else {
    debug(
      `No accept-language header; starting with default ${preferredLocale}`
    );
  }

  return preferredLocale;
}

/**
 * Get the preferred locale from the request headers.
 * @type {import('../internal').getPreferredLocale}
 */
module.exports = function getPreferredLocale(gasket, req) {
  const {
    defaultLocale,
    locales
  } = getIntlConfig(gasket);

  const preferredLocale = getLocaleFromHeaders(
    gasket,
    req,
    locales,
    defaultLocale
  );

  return preferredLocale;
};
