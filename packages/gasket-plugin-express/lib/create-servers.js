/* eslint-disable max-statements */
/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

/**
 * Create the Express instance and setup the lifecycle hooks.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
module.exports = async function createServers(gasket, serverOpts) {
  const app = gasket.actions.getExpressApp();
  app.use(require('cookie-parser')());

  await gasket.exec('express', app);

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: app
  };
};
