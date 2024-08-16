/* eslint-disable no-console */
const fallbackMap = {
  fatal: 'error',
  trace: 'debug'
};

/**
 * A helper function to ensure that all the required log levels
 * for a Fastify server are present.
 * @type {import('./index').alignLogger}
 */
function alignLogger(logger) {
  const fastifyLogger = logger;
  ['fatal', 'trace'].map(level => {
    if (!logger[level]) {
      fastifyLogger[level] = logger[fallbackMap[level]];
    }
  });

  return fastifyLogger;
}

module.exports = {
  alignLogger
};
