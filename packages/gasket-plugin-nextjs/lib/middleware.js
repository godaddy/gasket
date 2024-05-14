/// <reference types="@gasket/plugin-express" />

const getNextRoute = require('./utils/next-route');

module.exports = {
  timing: {
    before: ['@gasket/plugin-elastic-apm']
  },
  /** @type {import('@gasket/engine').HookHandler<'middleware'>} */
  handler: (gasket) => [
    (req, _res, next) => {
      req.getNextRoute = () => getNextRoute(gasket, req);
      next();
    }
  ]
};
