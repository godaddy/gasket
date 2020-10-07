const assume = require('assume');
const sinon = require('sinon');
const path = require('path');
const plugin = require('../lib/index');

describe('create', () => {
  // Simple test-helper to assert created with a clean set of spies.
  function expectCreatedWith(assertFn) {
    return async function expectCreated() {
      const spy = {
        pkg: { add: sinon.stub() },
        files: { add: sinon.stub() }
      };

      await plugin.hooks.create({}, spy);
      assertFn(spy);
    };
  }

  it('adds the appropriate globs', expectCreatedWith(({ files }) => {
    const rootDir = path.join(__dirname, '..');
    assume(files.add).calledWith(
      `${ rootDir }/generator/*`,
      `${ rootDir }/generator/**/*`
    );
  }));

  it('adds the appropriate dependencies', expectCreatedWith(({ pkg }) => {
    assume(pkg.add).calledWith('dependencies', {
      '@gasket/intl': require('../package.json').devDependencies['@gasket/intl'],
      'react-intl': require('../package.json').devDependencies['react-intl']
    });
  }));
});
