/// <reference types="@gasket/plugin-express" />

const serveStatic = require('serve-static');
const { getOutputDir } = require('./utils');

/** @type {import('@gasket/core').HookHandler<'express'>} */
module.exports = function express(gasket, app) {
  const outputDir = getOutputDir(gasket);

  app.use('/_workbox', serveStatic(outputDir, {
    index: false,
    maxAge: '1y',
    immutable: true
  }));
};
