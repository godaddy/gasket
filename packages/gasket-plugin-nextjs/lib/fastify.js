/// <reference types="@gasket/plugin-fastify" />

const { setupNextApp, setupNextHandling } = require('./utils/setup-next-app');

module.exports = {
  timing: {
    last: true
  },
  /** @type {import('@gasket/core').HookHandler<'fastify'>} */
  handler: async function fastify(gasket, fastifyApp) {
    const { exec } = gasket;

    const app = await setupNextApp(gasket);

    fastifyApp.decorate(
      ['buildId', app.name].filter(Boolean).join('/'), app.buildId
    );

    await exec('nextFastify', { next: app, fastify: fastifyApp });

    // TODO: Evaluate fix for this in Fastify4
    fastifyApp.addHook('onResponse', function setNextLocale(req, res, next) {
      // @ts-ignore
      if (res.locals && res.locals.gasketData && res.locals.gasketData.intl) {
        // @ts-ignore
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
