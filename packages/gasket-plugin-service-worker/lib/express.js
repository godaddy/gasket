/// <reference types="@gasket/plugin-express" />

import { getSWConfig } from './utils/utils.js';
import configureEndpoint from './utils/configure-endpoint.js';
/**
 * Express lifecycle to add an endpoint to serve service worker script
 * @type {import('@gasket/core').HookHandler<'express'>}
 */
export default async function express(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);
  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
