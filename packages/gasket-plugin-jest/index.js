module.exports = {
  name: require('./package').name,
  hooks: {
    async create(gasket, { files, pkg }) {
      const path = require('path');

      files.add(
        path.join(__dirname, 'generator', '*'),
        path.join(__dirname, 'generator', '**', '*')
      );

      pkg.add('devDependencies', {
        'jest': '^24.8.0',
        'enzyme': '^3.10.0',
        'enzyme-adapter-react-16': '^1.14.0',
        'eslint-plugin-jest': '^22.15.1'
      });

      pkg.add('scripts', {
        'test': 'jest',
        'test:watch': 'jest --watchAll',
        'test:coverage': 'jest --coverage'
      });

      pkg.add('eslintConfig', {
        extends: ['plugin:jest/recommended']
      });
    }
  }
};
