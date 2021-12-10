/* eslint-disable valid-jsdoc */
/* eslint-disable spaced-comment */
// @ts-check
///<reference types="@gasket/plugin-intl"/>

/** @typedef {import('@gasket/engine').Hook<'intlLocale'>} IntlLocaleHandler */

/** @type {IntlLocaleHandler} */
const handler = (gasket, currentLocale) => {
  // return 3; - does not pass validation
  return currentLocale === 'fr-CA' ? 'fr-FR' : currentLocale;
};

module.exports = handler;
