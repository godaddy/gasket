/* eslint-disable no-console */
/**
 * Create a child logger with additional metadata.
 * @type {import('./index.d.ts').createChildLogger}
 */
function createChildLogger(parent, metadata) {
  return {
    ...parent,
    debug: (...args) => console.debug(...args, metadata),
    error: (...args) => console.error(...args, metadata),
    info: (...args) => console.info(...args, metadata),
    warn: (...args) => console.warn(...args, metadata),
    child: (meta) => createChildLogger(parent, { ...metadata, ...meta })
  };
}

/**
 * Verify that the logger has all required levels.
 * @type {import('./index.d.ts').verifyLoggerLevels}
 */
function verifyLoggerLevels(logger) {
  /** @type {Array<keyof import('./index.d.ts').Logger>} */
  const requiredLevels = ['debug', 'error', 'info', 'warn', 'child'];

  requiredLevels.forEach((level) => {
    if (typeof logger[level] !== 'function') {
      throw new Error(`Logger is missing required level: ${level}`);
    }
  });
}

/**
 * Override global console methods to route output through the provided logger.
 * @param {import('./index.d.ts').Logger} logger - The gasket logger instance to route console calls through.
 */
function overrideConsole(logger) {
  console.error = (...args) => logger.error(...args);
  console.warn = (...args) => logger.warn(...args);
  console.log = (...args) => logger.info(...args);
  console.info = (...args) => logger.info(...args);
  console.debug = (...args) => logger.debug(...args);
  logger.info('[gasket-plugin-logger] console overridden to use gasket.logger');
}

export {
  createChildLogger,
  overrideConsole,
  verifyLoggerLevels
};
