import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 *
 * @param tryPath
 */
export function tryRequire(tryPath) {
  try {
    return require(tryPath);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}
