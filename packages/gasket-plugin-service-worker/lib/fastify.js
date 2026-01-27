/// <reference types="@gasket/plugin-fastify" />

import { getSWConfig } from './utils/utils.js';
import configureEndpoint from './utils/configure-endpoint.js';

/**
 * Fastify lifecycle to add an endpoint to serve service worker script
 * @type {import('@gasket/core').HookHandler<'fastify'>}
 */
export default async function fastify(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);

  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
