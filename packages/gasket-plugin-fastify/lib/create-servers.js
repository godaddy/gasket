/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

import { getAppInstance } from './utils.js';

/**
 * Create the Fastify instance and setup the lifecycle hooks.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
export default async function createServers(gasket, serverOpts) {
  const app = getAppInstance(gasket);

  // allow consuming apps to directly append options to their server
  await gasket.exec('fastify', app);

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  postRenderingStacks.forEach((stack) => {
    app.setErrorHandler((error, request, reply) => {
      stack(error, request.raw, reply.raw, (err) => {
        if (err && !reply.sent) {
          reply.send(err);
        }
      });
    });
  });

  return {
    ...serverOpts,
    handler: async function handler(...args) {
      await app.ready();
      app.server.emit('request', ...args);
    }
  };
}
