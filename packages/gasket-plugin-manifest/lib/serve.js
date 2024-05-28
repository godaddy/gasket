const baseConfig = require('./base-config');
/**
 * If configured, serve the resolved manifest.json
 * @param  {import("@gasket/core").Gasket} gasket The gasket API
 * @param  {object} app gasket's express/fastify server
 * @async
 */
async function serve(gasket, app) {
  const { config } = gasket;
  const { staticOutput } = (config && config.manifest) || {};
  const { path } = (config && config.manifest) || {};

  if (!staticOutput) {
    app.get(path || baseConfig.path, (req, res) => {
      res.send(req.manifest || {});
    });
  }
}

module.exports = serve;
