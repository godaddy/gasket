/**
 * Start up the HTTP servers.
 *
 * @param {Gasket}  gasket        The gasket API.
 * @param {Object}  opts          Server options.
 * @param {boolean} opts.dev      Whether the servers should be in dev mode.
 * @returns {Function} Promise-returning function that stops the servers.
 * @public
 */
async function startServers(gasket, { dev }) {
  const debug = require('diagnostics')('gasket:core');
  const createSsrMiddlewares = require('./ssr');

  const express = (await gasket.exec('expressCreate'))[0];
  const ssrList = await createSsrMiddlewares(gasket, express, dev);

  //
  // Now that express has been setup, and users have been able to
  // interact with the express router we want to add a last, catch all
  // route that will activate the `next`.
  //
  ssrList.forEach(ssr => express.all('*', ssr));

  //
  // Enable post-next.js-rendering middleware, usually error handlers
  //
  const postRenderingStacks = await gasket.exec('errorMiddleware');
  postRenderingStacks.forEach(stack => express.use(stack));

  //
  // Now that we've setup next and express, we want to setup our HTTP servers
  // as `express` will be used as handler for the HTTP servers.
  //
  const servers = (await gasket.exec('http', express))[0];

  return function destroy() {
    return Promise.all(Object.keys(servers).map((type) => {
      return new Promise(function kill(yep, nope) {
        servers[type].close(function closing(err) {
          if (err) {
            debug('failed to close the %s server:', type, err);
            return nope(err);
          }

          yep();
        });
      });
    }));
  };
}

module.exports = startServers;
