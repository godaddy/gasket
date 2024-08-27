/// <reference types="@gasket/core" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-express" />

const {
  name,
  version,
  description,
  devDependencies
} = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    create: {
      timing: {
        last: true,
        before: ['@gasket/plugin-lint']
      },
      handler: async function create(gasket, context) {
        const {files, pkg, typescript, apiApp} = context;
        const generatorDir = `${__dirname}/../generator`;
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

        // TODO: refactor
        if (apiApp) {
          if (typescript) {
            pkg.add('devDependencies', {
              '@types/jest': devDependencies['@types/jest'],
              'ts-jest': devDependencies['ts-jest'],
              'ts-node': devDependencies['ts-node']
            });

            pkg.add('scripts', {
              'test': 'GASKET_ENV=test jest',
              'test:watch': 'jest --watchAll',
              'test:coverage': 'jest --coverage'
            });
          } else {
            pkg.add('devDependencies', {
              'cross-env': devDependencies['cross-env']
            });
            pkg.add('scripts', {
              "test": "cross-env GASKET_ENV=test NODE_OPTIONS='--unhandled-rejections=strict --experimental-vm-modules' jest",
              "test:watch": "npm run test -- --watch",
              "test:coverage": "npm run test -- --coverage",
            });
          }
        } else {
          pkg.add('scripts', {
            'test': 'jest',
            'test:watch': 'jest --watchAll',
            'test:coverage': 'jest --coverage'
          });
        }
        // TODO: refactor
        // pkg.add('scripts', {
        //   'test': 'jest',
        //   'test:watch': 'jest --watchAll',
        //   'test:coverage': 'jest --coverage'
        // });
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

