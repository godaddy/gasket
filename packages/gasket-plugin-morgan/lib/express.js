/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />

import morgan from 'morgan';
import split from 'split';

/** @type {import('@gasket/core').HookHandler<'express'>} */
function handler(gasket, app) {
  const { logger, config } = gasket;
  const { morgan: { format = 'tiny', options = {} } = {} } = config;

  const stream = split().on('data', (line) => logger.info(line));
  const morganMiddleware = morgan(format, { ...options, stream });

  app.use(morganMiddleware);
}

// timing.first ensures Morgan middleware is registered before route handlers
// regardless of plugin order in gasket.ts. Express processes middleware in
// registration order, so Morgan must be app.use'd before any routes.
export default {
  timing: { first: true },
  handler
};
