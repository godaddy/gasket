/// <reference types="@gasket/plugin-fastify" />

import serveStatic from 'serve-static';
import { getOutputDir } from './utils.js';

/** @type {import('@gasket/core').HookHandler<'fastify'>} */
export default function fastify(gasket, app) {
  const outputDir = getOutputDir(gasket);

  app.register(serveStatic(outputDir, {
    index: false,
    maxAge: '1y',
    immutable: true
  }), { prefix: '/_workbox' });
}
