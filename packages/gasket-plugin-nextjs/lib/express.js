import { setupNextApp, setupNextHandling } from './utils/setup-next-app.js';

/**
 * Sets the build ID in the Express app
 * @param {import('express', { with: { "resolution-mode": "require" } }).Application} expressApp - Express application instance
 * @param {any} app - Next.js application instance (Next.js doesn't expose public types for server instances)
 */
function registerBuildId(expressApp, app) {
  const buildIdKey = ['buildId', app.name].filter(Boolean).join('/');
  expressApp.set(buildIdKey, app.buildId);
}

/**
 * Adds middleware to set the NEXT_LOCALE cookie.
 *
 * If the Gasket Intl Plugin is used to determine the locale, then we need
 * to let NextJS know that it has already been detected. We can do this by
 * forcing the `NEXT_LOCALE` cookie:
 * https://github.com/vercel/Next.js/blob/canary/docs/advanced-features/i18n-routing.md#leveraging-the-next_locale-cookie
 * @param {import('express', { with: { "resolution-mode": "require" } }).Application} expressApp - Express application instance
 */
function addNextLocaleMiddleware(expressApp) {
  expressApp.use(function setNextLocale(req, res, next) {
    const locale = res?.locals?.gasketData?.intl?.locale;
    if (locale) {
      req.headers.cookie = (req.headers.cookie || '') + `;NEXT_LOCALE=${locale}`;
    }
    next();
  });
}

/** @type {import('@gasket/core', { with: { "resolution-mode": "require" } }).HookHandler<'express'>} */
async function expressHandler(gasket, expressApp) {
  const app = await setupNextApp(gasket);
  registerBuildId(expressApp, app);

  await gasket.exec('nextExpress', { next: app, express: expressApp });

  addNextLocaleMiddleware(expressApp);

  // Now that express has been setup, and users have been able to interact
  // with the express router we want to add a last, catch all route that will
  // activate the `next`.
  setupNextHandling(app, expressApp, gasket);
}

export default {
  timing: { last: true },
  handler: expressHandler
};
