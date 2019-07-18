const debug = require('diagnostics')('gasket:express');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');

module.exports = {
  name: 'express',
  hooks: {
    /**
    * Create the Express instance and setup the lifecycle hooks.
    *
    * @param {Gasket} gasket Gasket API.
    * @param {Object} config application config.
    * @returns {Express} The web server.
    * @public
    */
    expressCreate: async function createExpress(gasket) {
      const { config } = gasket;
      const excludedRoutesRegex = config.express && config.express.excludedRoutesRegex;
      const app = express();

      if (excludedRoutesRegex) {
        app.use(excludedRoutesRegex, cookieParser());
      } else {
        app.use(cookieParser());
      }

      const { compression: compressionConfig = true } = config.express || {};
      if (compressionConfig) {
        app.use(compression());
      }

      const middlewares = await gasket.exec('middleware', app);

      debug('applied %s middleware layers to express', middlewares.length);
      middlewares.forEach(layer => {
        if (excludedRoutesRegex) {
          app.use(excludedRoutesRegex, layer);
        } else {
          app.use(layer);
        }
      });

      await gasket.exec('express', app);
      return app;
    }
  }
};
