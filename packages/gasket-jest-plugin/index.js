const { devDependencies } = require('./package.json');

module.exports = {
  name: 'jest',
  hooks: {
    async create(gasket, { files, pkg }) {
      const path = require('path');

      files.add(
        path.join(__dirname, 'generator', '*'),
        path.join(__dirname, 'generator', '**', '*')
      );

      pkg.add('devDependencies', {
        'jest': devDependencies.jest,
        // TODO (kinetifex): only add these if react in pkg. Same with setup.js
        'enzyme': devDependencies.enzyme,
        'enzyme-adapter-react-16': devDependencies['enzyme-adapter-react-16']
      });

      pkg.add('scripts', {
        'test': 'jest',
        'test:watch': 'jest --watchAll',
        'test:coverage': 'jest --coverage'
      });
    }
  }
};
