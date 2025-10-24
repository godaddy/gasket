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

export {
  createChildLogger,
  verifyLoggerLevels
};
