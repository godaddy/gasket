import path from 'path';
import { readFile } from 'fs/promises';

/**
 * Try to import a module.
 * @param {string} tryPath - The path to the module to import.
 * @returns {Promise<any>} The imported module.
 */
export async function tryImport(tryPath) {
  // Our linter doesn't allow import() syntax with options :(
  // That's the only reason we need to use fs/promises here
  try {
    const pkgPath = path.resolve(tryPath);
    let mod;
    if (tryPath.includes('.json')) {
      mod = JSON.parse(await readFile(pkgPath, 'utf8'));
    } else {
      mod = await import(pkgPath);
    }
    return mod.default || mod;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' || err.code === 'ERR_MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}
