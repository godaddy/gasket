/// <reference types="@gasket/plugin-fastify" />

const { setupNextApp, setupNextHandling } = require('./utils/setup-next-app');

module.exports = {
  timing: {
    last: true
  },
  /** @type {import('@gasket/engine').HookHandler<'fastify'>} */
  handler: async function fastify(gasket, fastifyApp) {
    const app = await setupNextApp(gasket);

    fastifyApp.decorate(['buildId', app.name].filter(Boolean).join('/'), {
      getter() {
        return app.buildId;
      }
    });

    await gasket.exec('nextFastify', { next: app, fastify: fastifyApp });

    fastifyApp.register(function setNextLocale(req, res, next) {
      if (res.locals && res.locals.gasketData && res.locals.gasketData.intl) {
        const { locale } = res.locals.gasketData.intl;

        if (locale) {
          req.headers.cookie =
            (req.headers.cookie || '') + `;NEXT_LOCALE=${locale}`;
        }
      }
      next();
    });

    setupNextHandling(app, fastifyApp, gasket);

    return app;
  }
};
