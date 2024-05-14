/**
 * Provide port defaults
 * @param {string} env env property from gasket config
 * @returns {number} Default port number
 * @public
 */
function getPortFallback(env = '') {
  return /local/.test(env) ? 8080 : 80;
}

/**
 * Check if the supplied errors are a result of the port being in use.
 * @param {Array<object>} errors Errors received from create-servers
 * @returns {boolean} Indication if the port was in use.
 * @private
 */
function portInUseError(errors) {
  const error = Array.isArray(errors) ? errors[0] : errors;
  return (
    ((error.http2 || error.https || error.http || {}).code || '') ===
    'EADDRINUSE'
  );
}

module.exports = {
  getPortFallback,
  portInUseError
};
