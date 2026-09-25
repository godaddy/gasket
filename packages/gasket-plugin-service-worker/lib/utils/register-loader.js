const { loadRegisterScript } = require('./utils');

/**
 * Webpack loader that emits the service worker registration script.
 * @this {import('webpack').LoaderContext<{ url: string, scope: string }>}
 * @returns {ReturnType<typeof loadRegisterScript>} registration script
 */
module.exports = function registerLoader() {
  return loadRegisterScript(this.getOptions());
};
