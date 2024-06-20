/// <reference types="@gasket/plugin-fastify" />

const { setupNextApp, setupNextHandling } = require('./utils/setup-next-app');

module.exports = {
  timing: {
    last: true
  },
  /** @type {import('@gasket/core').HookHandler<'fastify'>} */
  handler: async function fastify(gasket, fastifyApp) {
    const app = await setupNextApp(gasket);

    fastifyApp.decorate(['buildId', app.name].filter(Boolean).join('/'), {
      getter() {
        return app.buildId;
      }
    });

    await gasket.exec('nextFastify', { next: app, fastify: fastifyApp });

    // TODO: Evaluate fix for this in Fastify4
    fastifyApp.addHook('onResponse', async function setNextLocale(req, res, next) {
      const gasketData = await gasket.actions.getPublicGasketData(req);
      // @ts-ignore
      if (gasketData && gasketData.intl) {
        // @ts-ignore
        const { locale } = gasketData.intl;

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
