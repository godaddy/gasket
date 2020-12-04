const baseConfig = require('./base-config');
/**
 * If configured, serve the resolved manifest.json
 * @param  {Gasket} gasket The gasket API
 * @param  {Express} app gasket's express server
 * @async
 */
async function express(gasket, app) {
  const { config } = gasket;
  const { staticOutput } = (config && config.manifest || {});
  const { path } = (config && config.manifest || {});

  if (!staticOutput) {
    app.get(path || baseConfig.path, (req, res) => {
      res.send(req.manifest || {});
    });
  }
}

module.exports = express;
