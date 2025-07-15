import { fileURLToPath } from 'url';

/**
 * Try to import a module.
 *
 * @param {string} tryPath - The path to the module to import.
 * @returns {Promise<any>} The imported module.
 */
export async function tryImport(tryPath) {
  const options = {};
  if (tryPath.includes('.json')) {
    options.with = { type: 'json' };
  }
  try {
    const path = fileURLToPath(import.meta.resolve(tryPath));
    const mod = await import(path, options);
    return mod.default || mod;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' || err.code === 'ERR_MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}
