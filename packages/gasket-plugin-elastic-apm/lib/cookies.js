/**
 * Returns an array of cookie names which are considered sensitive because they
 * may contain session credential or PII
 *
 * @param {*} config the Gasket config object
 * @returns {string[]} an array of cookie names
 */
const sensitiveCookies = (config) => {
  if (
    typeof config.elasticAPM === 'undefined' ||
    typeof config.elasticAPM.sensitiveCookies === 'undefined'
  ) {
    return [];
  }

  return config.elasticAPM.sensitiveCookies;
};

/**
 * Redacts the contents of user-specified sensitive cookies
 *
 * @param {object} config The Gasket config
 * @param {object} payload The APM payload
 * @returns {object} a modified version of the incoming APM payload
 */
const filterSensitiveCookies = (config) => (payload) => {
  const cookiesToRedact = sensitiveCookies(config);

  if (
    payload.context &&
    payload.context.request &&
    payload.context.request.headers &&
    payload.context.request.headers.cookie
  ) {
    let cookie = payload.context.request.headers.cookie;
    cookiesToRedact.forEach((sc) => {
      cookie = cookie.replace(new RegExp(sc + '=([^;]+)'), sc + '=[REDACTED]');
    });

    payload.context.request.headers.cookie = cookie;
  }

  if (payload.context &&
    payload.context.request &&
    payload.context.request.cookies
  ) {
    cookiesToRedact.forEach((sc) => {
      if (sc in payload.context.request.cookies) {
        payload.context.request.cookies[sc] = '[REDACTED]';
      }
    });
  }

  return payload;
};

module.exports = {
  filterSensitiveCookies,
  sensitiveCookies
};
