/// <reference types="@gasket/core" />

const {
  name,
  version,
  description,
  devDependencies
} = require('../package.json');
const path = require('path');

/** @type {import('@gasket/core').Plugin} */
module.exports = {
  name,
  version,
  description,
  hooks: {
    create(gasket, context) {
      const { pkg, files } = context;

      pkg.add('devDependencies', {
        tsx: devDependencies.tsx,
        typescript: devDependencies.typescript
      });

      pkg.add('scripts', {
        build: 'tsc',
        start: 'node dist/server.js',
        local: 'GASKET_ENV=local tsx watch server.ts'
      });

      files.add(
        path.join(__dirname, '..', 'generator', '*')
      );
    }
  }
};
