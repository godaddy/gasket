/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

const { getAppInstance } = require('./utils.js');
/**
 * Create the Fastify instance and setup the lifecycle hooks.
 * Fastify is compatible with express middleware out of the box, so we can
 * use the same middleware lifecycles.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
module.exports = async function createServers(gasket, serverOpts) {
  /** Cast to Fastify + Express hybrid because Gasket adds `.use()` via @fastify/express plugin */
  const app = /** @type {import('fastify').FastifyInstance & { use: Function }} */ (getAppInstance(gasket));

  // allow consuming apps to directly append options to their server
  await gasket.exec('fastify', app);

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  postRenderingStacks.forEach((stack) => {
    /** @type {import('connect').NextHandleFunction} */
    const middleware = stack;
    app.use(middleware);
  });

  return {
    ...serverOpts,
    handler: async function handler(...args) {
      await app.ready();
      app.server.emit('request', ...args);
    }
  };
};
