/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

const { getAppInstance } = require('./utils.js');
/**
 * Create the Fastify instance and setup the lifecycle hooks.
 * Fastify is compatible with express middleware out of the box, so we can
 * use the same middleware lifecycles.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
// eslint-disable-next-line max-statements
module.exports = async function createServers(gasket, serverOpts) {
  const app = getAppInstance(gasket);

  // allow consuming apps to directly append options to their server
  // @ts-ignore
  await gasket.exec('fastify', app);

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  // @ts-ignore
  postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: async function handler(...args) {
      await app.ready();
      app.server.emit('request', ...args);
    }
  };
};
