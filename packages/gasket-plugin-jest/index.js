const { devDependencies } = require('./package.json');

module.exports = {
  name: require('./package').name,
  hooks: {
    create: {
      timing: {
        last: true,
        before: ['@gasket/plugin-lint']
      },
      handler: async function create(gasket, { files, pkg }) {
        const path = require('path');
        const isReactProject = pkg.has('dependencies', 'react');

        pkg.add('devDependencies', {
          jest: devDependencies.jest
        });

        if (isReactProject) {
          files.add(
            path.join(__dirname, 'generator', '*'),
            path.join(__dirname, 'generator', '**', '*')
          );

          pkg.add('devDependencies', {
            'enzyme': devDependencies.enzyme,
            'enzyme-adapter-react-16': devDependencies['enzyme-adapter-react-16']
          });
        }

        pkg.add('scripts', {
          'test': 'jest',
          'test:watch': 'jest --watchAll',
          'test:coverage': 'jest --coverage'
        });
      }
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        structures: [{
          name: 'test/',
          description: 'Test files'
        }, {
          name: 'jest.config.js',
          description: 'Jest configuration',
          link: 'https://jestjs.io/docs/configuration'
        }]
      };
    }
  }
};
