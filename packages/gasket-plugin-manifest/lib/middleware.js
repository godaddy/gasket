/// <reference types="@gasket/plugin-service-worker" />
/// <reference types="@gasket/plugin-express" />

const escapeRegex = require('escape-string-regexp');
const { gatherManifestData } = require('./utils');

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

    /** @type {import('./index').manifestMiddleware} */
    return async function manifestMiddleware(req, res, next) {
      if (endpoints.some((p) => req.path.match(p))) {
        req.manifest = await gatherManifestData(gasket, { req, res });
      }

      next();
    };
  }
}

module.exports = {
  timing: {
    last: true
  },
  handler
};
