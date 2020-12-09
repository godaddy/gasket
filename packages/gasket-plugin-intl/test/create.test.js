const assume = require('assume');
const sinon = require('sinon');
const path = require('path');
const plugin = require('../lib/index');

describe('create', function () {
  let mockContext;
  let pkgHasStub;
  let pkgAddStub;
  let filesAddStub;

  beforeEach(function () {
    pkgHasStub = sinon.stub().returns(true);
    pkgAddStub = sinon.stub();
    filesAddStub = sinon.stub();

    mockContext = {
      pkg: {
        add: pkgAddStub,
        has: pkgHasStub
      },
      files: {
        add: filesAddStub
      }
    };
  });

  it('adds the appropriate globs', async function () {
    const rootDir = path.join(__dirname, '..');
    await plugin.hooks.create({}, mockContext);
    assume(filesAddStub.args[0][0]).eqls(
      `${rootDir}/generator/*`,
      `${rootDir}/generator/**/*`
    );
  });

  it('does not add intl dependencies when react is not found', async function () {
    pkgHasStub.returns(false);
    await plugin.hooks.create({}, mockContext);
    assume(pkgAddStub).not.called();
  });

  it('adds the appropriate dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    assume(pkgAddStub.args[0]).eqls(['dependencies', {
      '@gasket/react-intl': require('../package.json').devDependencies['@gasket/react-intl'],
      'react-intl': require('../package.json').devDependencies['react-intl']
    }]);
  });
});
