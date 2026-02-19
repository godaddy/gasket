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
  if (postRenderingStacks.length) {
    // Fastify only supports one setErrorHandler per scope, so all Express-style
    // error handlers (err, req, res, next) are chained manually through a single
    // handler. request.raw and reply.raw expose the underlying Node.js
    // IncomingMessage and ServerResponse that Express-style handlers expect.
    app.setErrorHandler((error, request, reply) => {
      let index = 0;
      const next = (err) => {
        const current = err || error;
        if (index < postRenderingStacks.length) {
          postRenderingStacks[index++](current, request.raw, reply.raw, next);
        } else if (!reply.sent) {
          reply.send(current);
        }
      };
      next(error);
    });
  }

  return {
    ...serverOpts,
    handler: async function handler(...args) {
      await app.ready();
      app.server.emit('request', ...args);
    }
  };
}
