/// <reference types="@gasket/plugin-fastify" />

const serveStatic = require('serve-static');
const { getOutputDir } = require('./utils');

/**
 * Express lifecycle to set up route for serving workbox libraries
 * @type {import('@gasket/engine').HookHandler<'fastify'>}
 */
module.exports = function fastify(gasket, app) {
  const outputDir = getOutputDir(gasket);

  app.register(serveStatic(outputDir, {
    index: false,
    maxAge: '1y',
    immutable: true
  }), { prefix: '/_workbox' });
};
