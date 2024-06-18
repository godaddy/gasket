const path = require('path');
const plugin = require('../lib/index');
const { devDependencies, name } = require('../package.json');

describe('create', function () {
  let mockContext;
  let pkgHasStub;
  let pkgAddStub;
  let filesAddStub;
  let addPluginStub;

  beforeEach(function () {
    pkgHasStub = jest.fn().mockReturnValue(true);
    pkgAddStub = jest.fn();
    filesAddStub = jest.fn();
    addPluginStub = jest.fn();

    mockContext = {
      pkg: {
        add: pkgAddStub,
        has: pkgHasStub
      },
      files: {
        add: filesAddStub
      },
      gasketConfig: {
        addPlugin: addPluginStub
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
    const reactIntlDependencies = {
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    };
    expect(pkgAddStub).not.toHaveBeenCalledWith('dependencies', reactIntlDependencies);
  });

  it('adds the appropriate dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub.mock.calls[0]).toEqual(['dependencies', {
      [name]: devDependencies['@gasket/react-intl']
    }]);
    expect(pkgAddStub.mock.calls[1]).toEqual(['dependencies', {
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    }]);
  });
});
