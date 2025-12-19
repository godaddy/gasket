/// <reference types="@gasket/plugin-fastify" />

import { setupNextApp, setupNextHandling } from './utils/setup-next-app.js';

/**
 * Adds the buildId to Fastify via `decorate`
 * @param {import('fastify').FastifyInstance} fastifyApp
 *   Fastify application instance
 * @param {any} app - Next.js application instance (Next.js doesn't expose public types for server instances)
 */
function registerBuildId(fastifyApp, app) {
  const buildIdKey = ['buildId', app.name].filter(Boolean).join('/');
  fastifyApp.decorate(buildIdKey, app.buildId);
}

/**
 * Adds the `onResponse` hook to set NEXT_LOCALE
 * @param {import('fastify').FastifyInstance} fastifyApp
 *   Fastify application instance
 */
function addNextLocaleHook(fastifyApp) {
  fastifyApp.addHook('onResponse', function setNextLocale(req, res, next) {
    const locale = /** @type {any} */ (res)?.locals?.gasketData?.intl?.locale;
    if (locale) {
      req.headers.cookie = (req.headers.cookie || '') + `;NEXT_LOCALE=${locale}`;
    }
    next();
  });
}

/** @type {import('@gasket/core').HookHandler<'fastify'>} */
async function fastifyHandler(gasket, fastifyApp) {
  const app = await setupNextApp(gasket);
  registerBuildId(fastifyApp, app);

  await gasket.exec('nextFastify', { next: app, fastify: fastifyApp });

  addNextLocaleHook(fastifyApp);
  setupNextHandling(app, fastifyApp, gasket);
}

export default {
  timing: { last: true },
  handler: fastifyHandler
};
