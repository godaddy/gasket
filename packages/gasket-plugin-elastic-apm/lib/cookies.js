/**
 * Returns an array of cookie names which are considered sensitive because they
 * may contain session credential or PII
 * @param {import('@gasket/engine').GasketConfig} config The Gasket config
 * @returns {string[] | []} an array of cookie names
 */
function getSensitiveCookies(config) {
  const { elasticAPM } = config;
  return elasticAPM?.sensitiveCookies ?? [];
}

/**
 * Redacts the contents of user-specified sensitive cookies
 * @param {import('@gasket/engine').GasketConfig} config The Gasket config
 * @returns {(payload: { [propName: string]: any }) => { [propName: string]: any
 * }} The modified APM payload
 */
function filterSensitiveCookies(config) {
  /**
   * @param {{ [propName: string]: any }} payload The APM payload
   * @returns {{ [propName: string]: any }} The modified APM payload
   */
  return function (payload) {
    if (
      payload.context &&
      payload.context.request &&
      payload.context.request.headers &&
      payload.context.request.headers.cookie
    ) {
      let cookie = payload.context.request.headers.cookie;

      getSensitiveCookies(config).forEach(function (sc) {
        cookie = cookie.replace(
          new RegExp(sc + '=([^;]+)'),
          sc + '=[REDACTED]'
        );
      });

      payload.context.request.headers.cookie = cookie;
    }

    return payload;
  };
}

module.exports = {
  filterSensitiveCookies,
  getSensitiveCookies
};
