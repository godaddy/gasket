const path = require('path');
const { devDependencies } = require('../package.json');

module.exports = function create(gasket, context) {
  const generatorDir = path.join(__dirname, '..', 'generator');
  const {
    pkg,
    files,
    nextDevProxy,
    nextServerType,
    apiApp
  } = context;

  // Shared dependencies
  pkg.add('devDependencies', {
    tsx: devDependencies.tsx,
    typescript: devDependencies.typescript
  });

  // Scripts & files for API apps
  if (apiApp) {
    pkg.add('scripts', {
      build: 'tsc',
      start: 'node dist/server.js',
      local: 'GASKET_ENV=local tsx watch server.ts'
    });

    files.add(`${generatorDir}/api/*`, `${generatorDir}/shared/*`);
  }

  // Files for customServer
  if (nextServerType === 'customServer') {
    files.add(`${generatorDir}/next/*`, `${generatorDir}/shared/*`);
  }

  // Files for dev proxy w/o customServer
  if (nextDevProxy) {
    files.add(`${generatorDir}/next/*(tsconfig).json`, `${generatorDir}/shared/*`);
  }

  // Files for defaultServer w/o dev proxy
  if (!nextDevProxy && nextServerType !== 'customServer') {
    files.add(`${generatorDir}/next/*(tsconfig).json`);
  }
}