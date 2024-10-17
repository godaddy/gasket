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
        const {
          files,
          pkg,
          gasketConfig,
          packageManager = 'npm',
          typescript,
          apiApp
        } = context;
        const runCmd = packageManager === 'npm' ? `npm run` : packageManager;
        const generatorDir = `${__dirname}/../generator`;
        const isReactProject = pkg.has('dependencies', 'react');
        const fileExtension = typescript ? 'ts' : 'js';

        if (typescript) {
          pkg.add('devDependencies', {
            '@babel/preset-typescript': devDependencies['@babel/preset-typescript']
          });
        }

        pkg.add('devDependencies', {
          // Base assertion dependencies.
          'mocha': '^10.0.0',
          'nyc': '^15.1.0',
          'sinon': '^14.0.0',
          'chai': '^4.2.0',
          'setup-env': '^2.0.0',

          // To ensure that the mocha tests can run with import scripts
          '@babel/core': devDependencies['@babel/core']
        });

        if (isReactProject) {
          gasketConfig.addPlugin('pluginMocha', name);

          files.add(
            `${generatorDir}/react-app/*`,
            `${generatorDir}/react-app/**/.*`,
            `${generatorDir}/react-app/**/*`
          );

          pkg.add('devDependencies', {
            // All dependencies to correctly configure React Testing Library
            '@babel/preset-react': devDependencies['@babel/preset-react'],
            '@testing-library/react': devDependencies['@testing-library/react'],
            'jsdom': devDependencies.jsdom,
            'global-jsdom': devDependencies['global-jsdom'],
            [name]: `^${version}`
          });

          pkg.add('scripts', {
            // eslint-disable-next-line max-len
            'test:runner': `mocha -r global-jsdom/register -r setup-env -r ./test/register-loader.js --recursive "test/**/*.{test,spec}.{${fileExtension},${fileExtension}x}"`,
            'test:watch': `${runCmd} test:runner -- --watch --parallel -r ./test/mocha-watch-cleanup-after-each.js`
          });
        } else if (apiApp) {
          if (typescript) {
            files.add(
              `${generatorDir}/api-app/typescript/*`,
              `${generatorDir}/api-app/typescript/**/.*`,
              `${generatorDir}/api-app/typescript/**/*`
            );
            pkg.add('scripts', {
              'test:runner': `mocha -r ./test/register-loader.js -r 'test/mocha-setup.js' --recursive "test/**/*.*(test|spec).${fileExtension}"`,
              'test:watch': `${runCmd} test:runner -- --watch --parallel`
            });

            pkg.add('devDependencies', {
              'ts-node': devDependencies['ts-node'],
              '@types/mocha': devDependencies['@types/mocha']
            });
          } else {
            pkg.add('scripts', {
              'test:runner': `mocha -r setup-env --recursive "test/**/*.*(test|spec).${fileExtension}"`,
              'test:watch': `${runCmd} test:runner -- --watch --parallel`
            });
          }
        } else {
          pkg.add('scripts', {
            'test:runner': `mocha -r setup-env --recursive "test/**/*.*(test|spec).${fileExtension}"`,
            'test:watch': `${runCmd} test:runner -- --watch --parallel`
          });
        }

        pkg.add('scripts', {
          'test': 'npm run test:runner',
          'test:coverage': `nyc --reporter=text --reporter=json-summary ${runCmd} test:runner`
        });
      }
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        structures: [{
          name: 'test/',
          description: 'Test files'
        }]
      };
    }
  }
};

module.exports = plugin;
