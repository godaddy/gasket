/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="@gasket/plugin-middleware" />

const morgan = require('morgan');
const split = require('split');

/** @type {import('@gasket/core').HookHandler<'middleware'>} */
module.exports = function middleware(gasket) {
  const { logger, config } = gasket;
  const { morgan: { format = 'tiny', options = {} } = {} } = config;

  const stream = split().on('data', (line) => logger.info(line));

  const morganMiddleware = morgan(format, { ...options, stream });

  return [morganMiddleware];
};
