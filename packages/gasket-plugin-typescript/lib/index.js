const { name, devDependencies } = require('../package.json');
const path = require('path');

module.exports = {
  name,
  hooks: {
    create(gasket, context) {
      const { pkg, files } = context;

      pkg.add('devDependencies', {
        'nodemon': devDependencies.nodemon,
        'ts-node': devDependencies['ts-node'],
        'typescript': devDependencies.typescript
      });

      pkg.add('scripts', {
        build: 'tsc',
        start: 'node dist/server.js',
        local: 'nodemon server.ts'
      });

      files.add(
        path.join(__dirname, 'generator', '*')
      );
    }
  }
};
