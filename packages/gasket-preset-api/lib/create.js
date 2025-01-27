import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '../package.json' with { type: 'json' };
const { devDependencies } = pkg;

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
