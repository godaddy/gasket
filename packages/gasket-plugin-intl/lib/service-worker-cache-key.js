/**
 * Register a cache key function to get the language for a request
 *
 * @returns {function} cache key function
 */
module.exports = async function serviceWorkerCacheKey() {
  return function getLocale(req, res) {
    return res.locals.gasketData.intl.locale;
  };
};
