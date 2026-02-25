/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@gasket/plugin-logger" />

import morgan from 'morgan';
import split from 'split';

/** @type {import('@gasket/core').HookHandler<'fastify'>} */
export default function fastify(gasket, app) {
  const { logger, config } = gasket;
  const { morgan: { format = 'tiny', options = {} } = {} } = config;

  const stream = split().on('data', (line) => logger.info(line));
  const morganMiddleware = morgan(format, { ...options, stream });

  app.addHook('onRequest', (request, reply, done) => {
    morganMiddleware(request.raw, reply.raw, done);
  });
}
