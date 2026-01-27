/// <reference types="@gasket/plugin-express" />

import serveStatic from 'serve-static';
import { getOutputDir } from './utils.js';

/** @type {import('@gasket/core').HookHandler<'express'>} */
export default function express(gasket, app) {
  const outputDir = getOutputDir(gasket);

  app.use('/_workbox', serveStatic(outputDir, {
    index: false,
    maxAge: '1y',
    immutable: true
  }));
}
