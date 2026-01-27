/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

import { getAppInstance } from './utils.js';

/**
 * Create the Fastify instance and setup the lifecycle hooks.
 * Fastify is compatible with express middleware when @fastify/express is installed.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
export default async function createServers(gasket, serverOpts) {
  const app = getAppInstance(gasket);

  // allow consuming apps to directly append options to their server
  await gasket.exec('fastify', app);

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  if (postRenderingStacks.length > 0) {
    // app.use() is added by @fastify/express when registered via @gasket/plugin-middleware
    // @ts-expect-error
    if (typeof app.use !== 'function') {
      throw new Error(
        'errorMiddleware requires @fastify/express to be installed and registered. ' +
        'Install @fastify/express and ensure @gasket/plugin-middleware is configured.'
      );
    }
    postRenderingStacks.forEach((stack) => {
      /** @type {import('connect').NextHandleFunction} */
      const middleware = stack;
      // @ts-expect-error
      app.use(middleware);
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
