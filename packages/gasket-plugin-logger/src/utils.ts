/* eslint-disable no-console */
import type { Logger } from './index.js';

/**
 * Child loggers allow attaching contextual metadata (request ID, user ID, etc.)
 * that persists across log calls without passing it each time.
 */
export function createChildLogger(
  parent: Logger,
  metadata: Record<string, unknown>
): Logger {
  return {
    ...parent,
    debug: (...args: Array<unknown>): void => console.debug(...args, metadata),
    error: (...args: Array<unknown>): void => console.error(...args, metadata),
    info: (...args: Array<unknown>): void => console.info(...args, metadata),
    warn: (...args: Array<unknown>): void => console.warn(...args, metadata),
    child: (meta: Record<string, unknown>): Logger =>
      createChildLogger(parent, { ...metadata, ...meta })
  };
}

/**
 * Plugins can provide custom loggers - validate they implement the required
 * interface to prevent runtime errors when Gasket or other plugins use the logger.
 */
export function verifyLoggerLevels(logger: Logger): void {
  const requiredLevels: Array<keyof Logger> = ['debug', 'error', 'info', 'warn', 'child'];

  requiredLevels.forEach((level) => {
    if (typeof logger[level] !== 'function') {
      throw new Error(`Logger is missing required level: ${level}`);
    }
  });
}
