/// <reference types="@gasket/plugin-fastify" />

const serveStatic = require('serve-static');
const { getOutputDir } = require('./utils');

/** @type {import('@gasket/core').HookHandler<'fastify'>} */
module.exports = function fastify(gasket, app) {
  const outputDir = getOutputDir(gasket);

  app.register(serveStatic(outputDir, {
    index: false,
    maxAge: '1y',
    immutable: true
  }), { prefix: '/_workbox' });
};
