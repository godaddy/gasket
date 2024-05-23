const { name, devDependencies } = require('../package.json');
const path = require('path');

module.exports = {
  name,
  hooks: {
    create(gasket, context) {
      const { pkg, files } = context;

      pkg.add('devDependencies', {
        '@tsconfig/node20': devDependencies['@tsconfig/node20'],
        'tsx': devDependencies.tsx,
        'typescript': devDependencies.typescript
      });

      pkg.add('scripts', {
        build: 'tsc',
        start: 'node dist/server.js',
        local: 'tsx watch server.ts'
      });

      files.add(
        path.join(__dirname, '..', 'generator', '*')
      );
    }
  }
};
