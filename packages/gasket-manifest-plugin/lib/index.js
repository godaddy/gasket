/* eslint require-atomic-updates: warn */
const baseConfig = require('./base-config');
const escapeRegex = require('escape-string-regexp');

/**
 * Merges manifest defaults with gasket.config manifest and passes to
 * every defined `manifest` hook for further manipulation.
 *
 * @param  {Gasket} gasket The gasket API
 * @param {Request} req incoming HTTP request
 * @returns {Object} manifest.json
 */
async function gatherManifestData(gasket, req) {
  gasket.logger.debug(`Gathering manifest for ${req.originalUrl}`);

  const fromConfig = gasket.config.manifest;
  const manifest = { ...baseConfig, ...fromConfig };
  return await gasket.execWaterfall('manifest', manifest, { req }) || [];
}

module.exports = {
  name: 'manifest',
  hooks: {
    /**
     * If configured, serve the resolved manifest.json
     * @param  {Gasket} gasket The gasket API
     * @param  {Express} app gasket's express server
     * @async
     */
    async express(gasket, app) {
      const { config } = gasket;
      const { path } = (config && config.manifest || {});
      app.get(path || baseConfig.path, (req, res) => {
        res.send(req.manifest || {});
      });
    },
    middleware: {
      timing: {
        last: true
      },
      /**
       * Add some middleware to gather manifest details for certain endpoints
       *
       * @param {Gasket} gasket - The gasket API
       * @returns {function} Express middleware to apply
       */
      handler: function (gasket) {
        const { serviceWorker: { url: swUrl = '' } = {} } = gasket.config;

        const endpoints = [/manifest\.json/];
        if (swUrl) endpoints.push(new RegExp(escapeRegex(swUrl)));

        return async function manifestMiddleware(req, res, next) {
          if (endpoints.some(p => req.path.match(p))) {
            req.manifest = await gatherManifestData(gasket, req);
          }

          next();
        };
      }
    }
  }
};
