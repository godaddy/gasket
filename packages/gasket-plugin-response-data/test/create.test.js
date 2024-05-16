const plugin = require('../lib/index');
const { name, version, devDependencies } = require('../package.json');

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
      },
      gasketConfig: {
        add: jest.fn(),
        addPlugin: jest.fn()
      }
    };
  });

  it('adds itself to the dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub).toHaveBeenCalledWith('dependencies',
      expect.objectContaining({
        [name]: `^${version}`
      })
    );
  });

  it('adds the appropriate dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub).toHaveBeenCalledWith('dependencies',
      expect.objectContaining({
        '@gasket/data': devDependencies['@gasket/data']
      })
    );
  });

  it('adds plugin import to the gasket file', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginResponseData', name);
  });
});
