/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />

import morgan from 'morgan';
import split from 'split';

/** @type {import('@gasket/core').HookHandler<'express'>} */
export default function express(gasket, app) {
  const { logger, config } = gasket;
  const { morgan: { format = 'tiny', options = {} } = {} } = config;

  const stream = split().on('data', (line) => logger.info(line));
  const morganMiddleware = morgan(format, { ...options, stream });

  app.use(morganMiddleware);
}
