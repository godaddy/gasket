/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

const { getAppInstance } = require('./utils.js');

/**
 * Create the Express instance and setup the lifecycle hooks.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
async function createServers(gasket, serverOpts) {
  const app = getAppInstance(gasket);
  await gasket.exec('express', app);

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: app
  };
}

module.exports = createServers;
