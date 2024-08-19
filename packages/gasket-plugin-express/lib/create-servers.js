/* eslint-disable max-statements */
/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

/**
 * Create the Express instance and setup the lifecycle hooks.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
module.exports = async function createServers(gasket, serverOpts) {
  const express = require('express');

  const { config } = gasket;
  const {
    express: {
      routes
    } = {},
    http2
  } = config;

  const app = http2 ? require('http2-express-bridge')(express) : express();

  await gasket.exec('express', app);

  if (routes) {
    for (const route of routes) {
      if (typeof route !== 'function') {
        throw new Error('Route must be a function');
      }
      await route(gasket, app);
    }
  }

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: app
  };
};
