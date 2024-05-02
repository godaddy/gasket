import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { devDependencies } = require('../package.json');

export default function create(gasket, context) {
  const { pkg, files } = context;
  const __dirname = fileURLToPath(import.meta.url);
  const generatorDir = path.join(__dirname, '..', '..', 'generator');

  console.log('-------------------------');
  console.log('__dirname', __dirname);
  console.log('-------------------------');

  console.log('-------------------------');
  console.log('generatorDir', generatorDir);
  console.log('-------------------------');

  console.log('-------------------------');
  console.log('context.typescript', context.typescript);
  console.log('-------------------------');
  if (!context.typescript) {
    files.add(`${generatorDir}/*`);
    console.log('-------------------------');
    console.log('files', files);
    console.log('-------------------------');
    pkg.add('devDependencies', {
      nodemon: devDependencies.nodemon
    });

    pkg.add('scripts', {
      start: 'node server.js',
      local: 'GASKET_ENV=local nodemon server.js'
    });
  }
}
