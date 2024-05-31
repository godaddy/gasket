/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

/**
 * Create the Fastify instance and setup the lifecycle hooks.
 * Fastify is compatible with express middleware out of the box, so we can
 * use the same middleware lifecycles.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
// eslint-disable-next-line max-statements
module.exports = async function createServers(gasket, serverOpts) {
  const fastify = require('fastify');
  const { config, logger } = gasket;
  const {
    fastify: {
      routes,
      trustProxy = false
    } = {},
    http2
  } = config;

  // @ts-ignore
  const app = fastify({ logger, trustProxy, http2 });

  // allow consuming apps to directly append options to their server
  await gasket.exec('fastify', app);

  if (routes) {
    for (const route of routes) {
      if (typeof route !== 'function') {
        throw new Error('Route must be a function');
      }
      await route(app);
    }
  }

  // const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  // postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: async function handler(...args) {
      await app.ready();
      app.server.emit('request', ...args);
    }
  };
}
