const { setupNextApp, setupNextHandling } = require('./utils/setup-next-app');

module.exports = {
  timing: {
    last: true
  },
  /** @type {import('@gasket/engine').HookHandler<'express'>} */
  handler: async function express(gasket, expressApp) {
    const { exec } = gasket;

    const app = await setupNextApp(gasket);

    expressApp.set(
      ['buildId', app.name].filter(Boolean).join('/'),
      app.buildId
    );

    await exec('nextExpress', { next: app, express: expressApp });

    // If the Gasket Intl Plugin is used to determine the locale, then we need
    // to let NextJS know that it has already been detected. We can do this by
    // forcing the `NEXT_LOCALE` cookie:
    // https://github.com/vercel/Next.js/blob/canary/docs/advanced-features/i18n-routing.md#leveraging-the-next_locale-cookie
    expressApp.use(function setNextLocale(req, res, next) {
      if (res.locals && res.locals.gasketData && res.locals.gasketData.intl) {
        const { locale } = res.locals.gasketData.intl;

        if (locale) {
          req.headers.cookie =
            (req.headers.cookie || '') + `;NEXT_LOCALE=${locale}`;
        }
      }
      next();
    });

    // Now that express has been setup, and users have been able to interact
    // with the express router we want to add a last, catch all route that will
    // activate the `next`.
    setupNextHandling(app, expressApp, gasket);

    return app;
  }
};
