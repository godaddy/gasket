const path = require('path');
const plugin = require('../lib/index');
const { devDependencies, name } = require('../package.json');

describe('create', function () {
  let mockContext;
  let pkgHasStub;
  let pkgAddStub;
  let filesAddStub;
  let addPluginStub;
  let addStub;

  beforeEach(function () {
    pkgHasStub = jest.fn().mockReturnValue(true);
    pkgAddStub = jest.fn();
    filesAddStub = jest.fn();
    addPluginStub = jest.fn();
    addStub = jest.fn();

    mockContext = {
      pkg: {
        add: pkgAddStub,
        has: pkgHasStub
      },
      files: {
        add: filesAddStub
      },
      gasketConfig: {
        addPlugin: addPluginStub,
        add: addStub
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    expect(pkgAddStub.mock.calls[2]).toEqual(['dependencies', {
      '@gasket/helper-intl': devDependencies['@gasket/helper-intl'],
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    }]);
  });

  it('adds the appropriate scripts', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub).toHaveBeenCalledWith('scripts', {
      prebuild: 'node gasket.js build'
    });
  });

  it('adds the default intl.locales config', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(addStub).toHaveBeenCalledWith('intl', {
      locales: ['en-US']
    });
  });

  it('does nothing if hasGasketIntl is false', async function () {
    mockContext.hasGasketIntl = false;
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub).not.toHaveBeenCalled();
    expect(filesAddStub).not.toHaveBeenCalled();
    expect(addStub).not.toHaveBeenCalled();
  });
});
