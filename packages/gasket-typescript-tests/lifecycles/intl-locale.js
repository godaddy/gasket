/* eslint-disable valid-jsdoc */
/* eslint-disable spaced-comment */
// @ts-check
///<reference types="@gasket/plugin-intl"/>

/** @type {import('@gasket/core').Hook<'intlLocale'>} */
const handler = (gasket, currentLocale) => {
  // return 3; - does not pass validation
  return currentLocale === 'fr-CA' ? 'fr-FR' : currentLocale;
};

module.exports = handler;
