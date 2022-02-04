const { devDependencies } = require('./package.json');

module.exports = {
  name: require('./package').name,
  hooks: {
    create: {
      timing: {
        last: true,
        before: ['@gasket/plugin-lint']
      },
      handler: async function create(gasket, { files, pkg, packageManager = 'npm' }) {
        const runCmd = packageManager === 'npm' ? `npm run` : packageManager;
        const path = require('path');
        const isReactProject = pkg.has('dependencies', 'react');
        const isNextProject = pkg.has('dependencies', 'next');

        pkg.add('devDependencies', {
          //
          // Base assertion dependencies.
          //
          'mocha': devDependencies.mocha,
          'nyc': devDependencies.nyc,
          'sinon': devDependencies.sinon,
          'chai': devDependencies.chai,
          'setup-env': devDependencies['setup-env'],

          //
          // To ensure that the mocha tests can run with import scripts
          //
          '@babel/register': devDependencies['@babel/register'],
          '@babel/core': devDependencies['@babel/core']
        });

        if (isReactProject) {
          files.add(
            path.join(__dirname, 'generator', '*'),
            path.join(__dirname, 'generator', '**', '*')
          );

          pkg.add('devDependencies', {
            //
            // All dependencies to correctly configure React Testing Library
            //
            'jsdom': devDependencies.jsdom,
            '@testing-library/react': devDependencies['@testing-library/react'],
            'global-jsdom': devDependencies['global-jsdom']
          });

          pkg.add('scripts', {
            // eslint-disable-next-line max-len
            'test:runner': `mocha -r global-jsdom/register -r setup-env ${isNextProject ? '-r ./test/setup.js' : ''} --recursive "test/**/*.*(test|spec).js"`,
            'test:watch': `${runCmd} test:runner -- --watch -r ./test/mocha-watch-cleanup-after-each.js`
          });
        } else {
          pkg.add('scripts', {
            'test:runner': 'mocha -r setup-env --recursive "test/**/*.*(test|spec).js"',
            'test:watch': `${runCmd} test:runner -- --watch`
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
