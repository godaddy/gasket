/// <reference types="@gasket/plugin-fastify" />

const { setupNextApp, setupNextHandling } = require('./utils/setup-next-app');

/** Adds the buildId to Fastify via `decorate` */
function registerBuildId(fastifyApp, app) {
  const buildIdKey = ['buildId', app.name].filter(Boolean).join('/');
  fastifyApp.decorate(buildIdKey, app.buildId);
}

/** Adds the `onResponse` hook to set NEXT_LOCALE */
function addNextLocaleHook(fastifyApp) {
  fastifyApp.addHook('onResponse', function setNextLocale(req, res, next) {
    const locale = res?.locals?.gasketData?.intl?.locale;
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

module.exports = {
  timing: { last: true },
  handler: fastifyHandler
};
