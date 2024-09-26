import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { devDependencies } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, context) {
  const { pkg, files } = context;
  const __dirname = fileURLToPath(import.meta.url);
  const generatorDir = path.join(__dirname, '..', '..', 'generator');
  files.add(`${generatorDir}/*.md`);

  if (!context.typescript) {
    files.add(`${generatorDir}/*.js`);

    pkg.add('devDependencies', {
      nodemon: devDependencies.nodemon
    });

    pkg.add('scripts', {
      start: 'node server.js',
      local: 'nodemon server.js',
      preview: 'npm run start'
    });
  }
}
