import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { dependencies, devDependencies } = require('../package.json');

export default function create(gasket, context) {
  const { pkg, files } = context;
  const __dirname = fileURLToPath(import.meta.url);
  const generatorDir = `${__dirname}/../../generator`;

  pkg.add('dependencies', dependencies);

  if (!context.typescript) {
    files.add(`${generatorDir}/*`);

    pkg.add('devDependencies', devDependencies);

    pkg.add('scripts', {
      start: 'node server.js',
      local: 'GASKET_ENV=local nodemon server.js'
    });
  }
}
