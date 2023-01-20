/* eslint-disable max-statements */
const mockReadFileStub = jest.fn();
const mockJoinStub = jest.fn();
const mockPackageManagerStub = jest.fn();
const mockPackageManagerExecStub = jest.fn();
const mockFakePackage = jest.fn();
const mockLoggerInfoStub = jest.fn();
const mockTryResolveStub = jest.fn();
const mockResolveStub = jest.fn();

const mockGasket = {
  config: {
    root: '/app'
  },
  logger: {
    info: mockLoggerInfoStub
  }
};

jest.mock('fs/promises', () => ({
  readFile: mockReadFileStub
}));

jest.mock('path', () => ({
  join: mockJoinStub
}));

jest.mock('../lib/package-manager', () => class MockPackageManager {
  constructor() { mockPackageManagerStub(...arguments); }
  exec() { mockPackageManagerExecStub(...arguments); }
});

jest.mock('../lib/try-resolve', () => ({
  tryResolve: mockTryResolveStub,
  resolve: mockResolveStub
}));

jest.mock('my-package', () => mockFakePackage, { virtual: true });
jest.mock('@scoped/package', () => mockFakePackage, { virtual: true });

const requireWithInstall = require('../lib/require-with-install');


describe('requireWithInstall', function () {

  afterEach(function () {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('npm package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      mockReadFileStub.mockRejectedValueOnce();
      mockTryResolveStub.mockReturnValueOnce(false);
      mockFakePackage.mockResolvedValueOnce(false);
      mockResolveStub.mockReturnValueOnce('my-package');
      await requireWithInstall('my-package', mockGasket);

      expect(mockLoggerInfoStub.mock.calls[0][0])
        .toEqual('requireWithInstall - installing "my-package" with "npm" - save as a devDependency to avoid this');
      expect(mockPackageManagerStub.mock.calls[0][0].packageManager)
        .toEqual('npm');
      expect(mockPackageManagerExecStub.mock.calls[0][0])
        .toEqual('install');
      expect(mockPackageManagerExecStub.mock.calls[0][1])
        .toEqual(['my-package', '--no-save', '--force']);
    });

    it('does not install when package is present', async function () {
      mockReadFileStub.mockRejectedValueOnce();
      mockTryResolveStub.mockReturnValueOnce('my-package');
      mockFakePackage.mockResolvedValueOnce(true);
      await requireWithInstall('my-package', mockGasket);

      expect(mockTryResolveStub.mock.results[0].value).toEqual('my-package');
      expect(await mockFakePackage()).toEqual(true);
    });
  });

  describe('yarn package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      mockReadFileStub.mockResolvedValueOnce(true);
      mockTryResolveStub.mockReturnValueOnce(false);
      mockFakePackage.mockResolvedValueOnce(false);
      mockResolveStub.mockReturnValueOnce('my-package');
      await requireWithInstall('my-package', mockGasket);
      expect(mockLoggerInfoStub.mock.calls[0][0])
        .toEqual('requireWithInstall - installing "my-package" with "yarn" - saving as a devDependency');
      expect(mockPackageManagerStub.mock.calls[0][0].packageManager)
        .toEqual('yarn');
      expect(mockPackageManagerExecStub.mock.calls[0][0])
        .toEqual('add');
      expect(mockPackageManagerExecStub.mock.calls[0][1])
        .toEqual(['my-package', '--dev']);
    });

    it('does not install when package is present', async function () {
      mockReadFileStub.mockResolvedValueOnce();
      mockTryResolveStub.mockReturnValueOnce('my-package');
      mockFakePackage.mockResolvedValueOnce(true);
      await requireWithInstall('my-package', mockGasket);
      expect(mockTryResolveStub.mock.results[0].value)
        .toEqual('my-package');
      expect(await mockFakePackage())
        .toEqual(true);
    });
  });

  describe('scoped packages', function () {

    it('allows for scoped package', async function () {
      mockReadFileStub.mockRejectedValueOnce();
      mockTryResolveStub.mockReturnValueOnce(false);
      mockFakePackage.mockResolvedValueOnce(false);
      mockResolveStub.mockReturnValueOnce('@scoped/package');
      await requireWithInstall('@scoped/package', mockGasket);

      expect(mockLoggerInfoStub.mock.calls[0][0])
        .toEqual('requireWithInstall - installing "@scoped/package" with "npm" - save as a devDependency to avoid this');
      expect(mockPackageManagerStub.mock.calls[0][0].packageManager)
        .toEqual('npm');
      expect(mockPackageManagerExecStub.mock.calls[0][0])
        .toEqual('install');
      expect(mockPackageManagerExecStub.mock.calls[0][1][0])
        .toEqual('@scoped/package');
    });

    it('does not install when scoped package is present', async function () {
      mockReadFileStub.mockRejectedValueOnce();
      mockTryResolveStub.mockReturnValueOnce('@scoped/package');
      mockFakePackage.mockResolvedValueOnce(true);
      await requireWithInstall('@scoped/package', mockGasket);
      expect(mockTryResolveStub.mock.results[0].value)
        .toEqual('@scoped/package');
      expect(await mockFakePackage())
        .toEqual(true);
    });
  });

  describe('list of packages', function () {
    it('allows for the first parameter to be an array of strings', async function () {
      const dependencies = ['my-package', '@scoped/package'];
      mockResolveStub
        .mockReturnValueOnce(dependencies[0])
        .mockReturnValueOnce(dependencies[1]);

      const pkgList = await requireWithInstall(dependencies, mockGasket);

      expect(Array.isArray(pkgList)).toEqual(true);
      expect(pkgList.length).toEqual(2);
      expect(mockPackageManagerExecStub).toHaveBeenCalledWith('add', expect.arrayContaining(['my-package', '@scoped/package', '--dev']));
    });
  });
});
