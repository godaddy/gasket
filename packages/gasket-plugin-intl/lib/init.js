/**
 * For SSR with Node < 14, we must polyfill Intl to make sure all locale data is
 * available. For the browser, this may need polyfilled matching app requirements.
 * @see: https://techoverflow.net/2018/09/19/fixing-nodejs-intl-datetimeformat-not-formatting-properly-for-locales/
 *
 * For Node >= 14, full-icu is supported, so we avoid the polyfill
 * @see: https://formatjs.io/docs/guides/runtime-requirements/#nodejs
 */
module.exports = function initHook() {
  const semver = require('semver');
  const current = semver.coerce(process.version).version;
  if (!semver.satisfies(current, '>=14')) {
    global.Intl = require('intl');
  }
};
