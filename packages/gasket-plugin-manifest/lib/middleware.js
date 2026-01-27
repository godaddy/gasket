/// <reference types="@gasket/plugin-service-worker" />
/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-middleware" />

import escapeRegex from 'escape-string-regexp';
import { gatherManifestData } from './utils.js';

/**
 * Add some middleware to gather manifest details for certain endpoints
 * @type {import('@gasket/core').HookHandler<'middleware'>}
 */
function handler(gasket) {
  const {
    serviceWorker: { url: swUrl = '' } = {},
    manifest: { staticOutput = false }
  } = gasket.config;

  if (!staticOutput) {
    const endpoints = [/manifest\.json/];

    if (swUrl) endpoints.push(new RegExp(escapeRegex(swUrl)));

    /** @type {import('./index.d.ts').manifestMiddleware} */
    return async function manifestMiddleware(req, res, next) {
      if (endpoints.some((p) => req.path.match(p))) {
        req.manifest = await gatherManifestData(gasket, { req, res });
      }

      next();
    };
  }
}

export default {
  timing: {
    last: true
  },
  handler
};
