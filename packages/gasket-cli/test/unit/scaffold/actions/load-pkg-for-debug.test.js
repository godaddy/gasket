const mockReadFileStub = jest.fn();

jest.mock('fs', () => ({
  promises: {
    readFile: mockReadFileStub
  }
}));

const path = require('path');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');
const loadPkg = require('../../../../src/scaffold/actions/load-pkg-for-debug');

describe('load-pkg-for-debug', () => {
  let mockContext, mockPkg;
  let packageJsonSpy;

  beforeEach(() => {
    jest.restoreAllMocks();
    mockPkg = {
      name: 'my-app',
      description: 'my cool app',
      dependencies: {
        '@gasket/default-preset': '^1.0.0'
      }
    };

    mockReadFileStub.mockResolvedValue(JSON.stringify(mockPkg));
    packageJsonSpy = jest.spyOn(ConfigBuilder, 'createPackageJson');
    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app'
    };
  });

  it('is decorated action', async () => {
    expect(loadPkg).toHaveProperty('wrapped');
  });

  it('loads the package.json file under destination', async () => {
    await loadPkg(mockContext);
    const expected = path.join(mockContext.dest, 'package.json');
    expect(mockReadFileStub).toHaveBeenCalledWith(expected, 'utf8');
  });

  it('instantiates a new ConfigBuilder', async () => {
    await loadPkg(mockContext);
    expect(packageJsonSpy).toHaveBeenCalled();
  });

  it('adds the fields from loaded file to pkg', async () => {
    await loadPkg(mockContext);
    const expected = mockPkg;
    expect(packageJsonSpy.mock.calls[0][0]).toEqual(expected);
  });

  it('assigns pkg to context', async () => {
    await loadPkg(mockContext);
    expect(mockContext).toHaveProperty('pkg');
    expect(mockContext.pkg).toBeInstanceOf(ConfigBuilder);
  });
});
