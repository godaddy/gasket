import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Create hook adds template files if gitInit
 *
 * @param {Gasket} gasket - Gasket
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
export default async function create(gasket, context) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const { gitInit, files } = context;
  if (gitInit) {
    files.add(
      join(__dirname, '..', 'generator', '.*')
    );
  }
};
