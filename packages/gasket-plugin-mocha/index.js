const { devDependencies } = require('./package.json');

module.exports = {
  name: require('./package').name,
  hooks: {
    create: {
      timing: {
        last: true,
        before: ['@gasket/plugin-lint']
      },
      handler: async function create(gasket, { pkg, packageManager = 'npm' }) {
        const runCmd = packageManager === 'npm' ? `npm run` : packageManager;
        const isReactProject = pkg.has('dependencies', 'react');

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
          pkg.add('devDependencies', {
            //
            // All dependencies to correctly configure React Testing Library
            //
            'jsdom': devDependencies.jsdom,
            '@testing-library/react': devDependencies['@testing-library/react'],
            'global-jsdom': devDependencies['global-jsdom']
          });
        }

        pkg.add('scripts', {
          'test': 'npm run test:runner',
          'test:runner': 'mocha --require global-jsdom/register --require setup-env --recursive "test/**/*.*(test|spec).js"',
          'test:coverage': `nyc --reporter=text --reporter=json-summary ${runCmd} test:runner`,
          'test:watch': `${runCmd} test:runner -- --watch`
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
