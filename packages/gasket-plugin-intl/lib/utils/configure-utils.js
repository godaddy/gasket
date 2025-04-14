/**
 * Shortcut to get the gasket.config.intl object
 * @param {Partial<import("@gasket/core").Gasket>} gasket - Gasket API
 * @returns {import('../index').IntlConfig} intl config
 */
function getIntlConfig(gasket) {
  return gasket.config.intl;
}


module.exports = {
  getIntlConfig
};
