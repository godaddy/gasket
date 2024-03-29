const { devDependencies, name } = require('../package.json');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    create: {
      timing: {
        last: true,
        before: ['@gasket/plugin-lint']
      },
      handler: async function create(gasket, { files, pkg }) {
        const generatorDir = `${ __dirname }/../generator`;
        const isReactProject = pkg.has('dependencies', 'react');

        pkg.add('devDependencies', {
          jest: devDependencies.jest
        });

        if (isReactProject) {
          files.add(
            `${generatorDir}/*`,
            `${generatorDir}/**/*`
          );

          pkg.add('devDependencies', {
            '@testing-library/react': devDependencies['@testing-library/react'],
            '@testing-library/jest-dom': devDependencies['@testing-library/jest-dom'],
            'jest-environment-jsdom': devDependencies['jest-environment-jsdom']
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

module.exports = plugin;

