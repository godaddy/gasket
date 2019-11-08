/**
 * For SSR, the node we need to polyfill Intl to make sure all locale data is available.
 * For the browser, this should be polyfilled matching app requirements.
 *
 * @see: https://techoverflow.net/2018/09/19/fixing-nodejs-intl-datetimeformat-not-formatting-properly-for-locales/
 */
module.exports = function initHook() {
  global.Intl = require('intl');
};
