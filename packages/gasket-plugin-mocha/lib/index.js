/// <reference types="@gasket/core" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

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
      handler: async function create(gasket, { files, pkg, gasketConfig, packageManager = 'npm' }) {
        const runCmd = packageManager === 'npm' ? `npm run` : packageManager;
        const generatorDir = `${__dirname}/../generator`;
        const isReactProject = pkg.has('dependencies', 'react');

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
            `${generatorDir}/*`,
            `${generatorDir}/**/.*`,
            `${generatorDir}/**/*`
          );

          pkg.add('devDependencies', {
            // All dependencies to correctly configure React Testing Library
            'jsdom': devDependencies.jsdom,
            '@testing-library/react': devDependencies['@testing-library/react'],
            'global-jsdom': devDependencies['global-jsdom'],
            [name]: `^${version}`
          });

          pkg.add('scripts', {
            // eslint-disable-next-line max-len
            'test:runner': `mocha -r global-jsdom/register -r setup-env -r ./test/register-loader.js --recursive "test/**/*.*(test|spec).js"`,
            'test:watch': `${runCmd} test:runner -- --watch --parallel -r ./test/mocha-watch-cleanup-after-each.js`
          });
        } else {
          pkg.add('scripts', {
            'test:runner': 'mocha -r setup-env --recursive "test/**/*.*(test|spec).js"',
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
