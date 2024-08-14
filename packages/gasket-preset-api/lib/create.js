import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { devDependencies } = require('../package.json');

/**
 * createHook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 */
export default function create(gasket, context) {
  const { pkg, files } = context;
  const __dirname = fileURLToPath(import.meta.url);
  const generatorDir = path.join(__dirname, '..', '..', 'generator');

  if (!context.typescript) {
    files.add(`${generatorDir}/*`);

    pkg.add('devDependencies', {
      nodemon: devDependencies.nodemon
    });

    pkg.add('scripts', {
      start: 'node server.js',
      local: 'GASKET_ENV=local nodemon server.js',
      preview: 'npm run build && npm run start'
    });
  }
}
