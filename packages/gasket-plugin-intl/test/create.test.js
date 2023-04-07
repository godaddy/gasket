const path = require('path');
const plugin = require('../lib/index');

describe('create', function () {
  let mockContext;
  let pkgHasStub;
  let pkgAddStub;
  let filesAddStub;

  beforeEach(function () {
    pkgHasStub = jest.fn().mockReturnValue(true);
    pkgAddStub = jest.fn();
    filesAddStub = jest.fn();

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
    expect(filesAddStub.mock.calls[0][0]).toEqual(
      `${rootDir}/generator/*`,
      `${rootDir}/generator/**/*`
    );
  });

  it('does not add intl dependencies when react is not found', async function () {
    pkgHasStub.mockReturnValue(false);
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub).not.toHaveBeenCalled();
  });

  it('adds the appropriate dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub.mock.calls[0]).toEqual(['dependencies', {
      '@gasket/react-intl': require('../package.json').devDependencies['@gasket/react-intl'],
      'react-intl': require('../package.json').devDependencies['react-intl']
    }]);
  });
});
