import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 *
 * @param tryPath
 */
export function tryRequire(tryPath) {
  try {
    console.log('tryRequire', tryPath);
    return require(tryPath);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('-----booooo', tryPath)
      return null;
    }
    throw err;
  }
}
