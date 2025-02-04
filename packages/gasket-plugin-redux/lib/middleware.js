/* eslint require-atomic-updates: warn */
/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />

/**
 * Configure middleware
 * @type {import('@gasket/core').HookHandler<'middleware'>}
 */
module.exports = async function middlewareHook(gasket) {
  const { redux: reduxConfig = {} } = gasket.config;

  if (!reduxConfig.makeStore) {
    throw new Error(
      'Could not find redux store file. Add a store.js file or configure redux.makeStore in gasket.js.'
    );
  }

  const mod = await import(reduxConfig.makeStore);
  /** @type {import('@gasket/redux').MakeStoreFn} */
  const makeStore = mod.makeStore ?? mod.default;

  /**
   * Middleware to attach the redux store to the req object for use in other
   * middleware
   * @type {import('./index').reduxMiddleware}
   */
  return async function middleware(req, res, next) {
    const context = { req, res };
    let initState = reduxConfig.initState || {};

    await gasket.execApply(
      'initReduxState',
      async (plugin, handler) => {
        const name = plugin ? plugin.name || 'unnamed plugin' : 'app lifecycles';
        gasket.logger.warn(
          `DEPRECATED \`initReduxState\` lifecycle in ${name} will not be support in future major release.`
        );

        // eslint-disable-next-line require-atomic-updates
        initState = await handler(initState, context);
      }
    );

    const store = makeStore(initState, {
      logger: reduxConfig.logger || gasket.logger,
      req
    });

    await gasket.execApply(
      'initReduxStore',
      async (plugin, handler) => {
        const name = plugin ? plugin.name || 'unnamed plugin' : 'app lifecycles';
        gasket.logger.warn(
          `DEPRECATED \`initReduxStore\` lifecycle in ${name} will not be support in future major release.`
        );

        handler(store, context);
      }
    );

    // eslint-disable-next-line require-atomic-updates
    req.store = store;

    if (!res.headersSent) return next();
  };
};
