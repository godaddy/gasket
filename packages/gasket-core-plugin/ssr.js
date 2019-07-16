const path = require('path');

module.exports = async function createSsrMiddlewares(gasket, express, dev) {
  const { root, routes } = gasket.config || {};
  const routesModulePath = path.join(root, routes || './routes');
  const requestHandlers = [];

  const nextList = await gasket.exec('nextCreate', dev);
  nextList.forEach(next => {
    //
    // Expose the buildId on the express server so it can be read by applications
    // as there currently is no other way of accessing the buildId your apps,
    // making it impossible to reference certain assets.
    //
    express.set(['buildId', next.name].filter(Boolean).join('/'), next.buildId);

    gasket.exec('ssr', { express, next });
    try {
      let router = require(routesModulePath);

      // Handle ES6-style modules
      if (router.default) {
        router = router.default;
      }

      requestHandlers.push(router.getRequestHandler(next));
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }

      requestHandlers.push(next.getRequestHandler());
    }
  });

  return requestHandlers;
};
