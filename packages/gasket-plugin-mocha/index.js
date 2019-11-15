const { devDependencies } = require('./package.json');

module.exports = {
  name: require('./package').name,
  hooks: {
    async create(gasket, { files, pkg, packageManager = 'npm' }) {
      const runCmd = packageManager === 'npm' ? `npm run` : packageManager;
      const path = require('path');

      files.add(
        path.join(__dirname, 'generator', '*'),
        path.join(__dirname, 'generator', '**', '*'),
        path.join(__dirname, 'generator', '**', '**', '*')
      );

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
        // All dependencies to correctly configure enzyme with shallow rendering
        //
        'jsdom': devDependencies.jsdom,
        'enzyme': devDependencies.enzyme,
        'enzyme-adapter-react-16': devDependencies['enzyme-adapter-react-16'],

        //
        // To ensure that the mocha tests can run with import scripts
        //
        '@babel/register': devDependencies['@babel/register'],
        '@babel/core': devDependencies['@babel/core']
      });

      pkg.add('scripts', {
        'test': 'npm run test:runner',
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"',
        'test:coverage': `nyc --reporter=text --reporter=json-summary ${runCmd} test:runner`,
        'test:watch': `${runCmd} test:runner -- --watch`
      });
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        structures: [{
          name: 'test',
          description: 'Test files'
        }]
      };
    }
  }
};
