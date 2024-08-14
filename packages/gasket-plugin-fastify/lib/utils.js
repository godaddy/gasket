/* eslint-disable no-console */
const logLevels = {
  debug: console.debug,
  error: console.error,
  info: console.info,
  warn: console.warn,
  fatal: console.error,
  trace: console.debug
};

/**
 * A helper function to ensure that all the required log levels
 * for a Fastify server are present.
 * @type {import('./index').alignLogger}
 */
function alignLogger(logger) {
  const fastifyLogger = logger;
  ['fatal', 'trace', 'debug', 'error', 'warn', 'info'].map(level => {
    if (!logger[level]) {
      fastifyLogger[level] = logLevels[level];
    }
  });

  return fastifyLogger;
}

module.exports = {
  alignLogger
};
