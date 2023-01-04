/* eslint-disable max-statements */
const proxyquire = require('proxyquire').noCallThru();
const assume = require('assume');
const sinon = require('sinon');

describe('requireWithInstall', function () {
  let requireWithInstall;
  let mockGasket;
  let mockImports;
  let readFileStub;
  let joinStub;
  let packageManagerStub;
  let packageManagerExecStub;
  let fakePackage;
  let loggerInfoStub;
  let tryResolveStub;
  let resolveStub;

  beforeEach(function () {
    readFileStub = sinon.stub();
    joinStub = sinon.stub();
    packageManagerStub = sinon.stub();
    packageManagerExecStub = sinon.stub();
    fakePackage = sinon.stub();
    loggerInfoStub = sinon.stub();
    tryResolveStub = sinon.stub();
    resolveStub = sinon.stub();

    mockGasket = {
      config: {
        root: '/app'
      },
      logger: {
        info: loggerInfoStub
      }
    };

    mockImports = {
      'fs/promises': {
        readFile: readFileStub
      },
      'path': {
        join: joinStub
      },
      './package-manager': class MockPackageManager {
        constructor() { packageManagerStub(...arguments); }
        exec() { packageManagerExecStub(...arguments); }
      },
      './try-resolve': {
        tryResolve: tryResolveStub,
        resolve: resolveStub
      },
      'my-package': fakePackage,
      '@scoped/package': fakePackage
    };

    requireWithInstall = proxyquire('../lib/require-with-install', mockImports);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('npm package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.rejects();
      tryResolveStub.returns(false);
      fakePackage.resolves(false);
      resolveStub.returns('my-package');
      await requireWithInstall('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('requireWithInstall - installing "my-package" with "npm" - save as a devDependency to avoid this');
      assume(packageManagerStub.args[0][0].packageManager)
        .equals('npm');
      assume(packageManagerExecStub.args[0][0])
        .equals('install');
      assume(packageManagerExecStub.args[0][1])
        .eqls(['my-package', '--no-save', '--force']);
    });

    it('does not install when package is present', async function () {
      readFileStub.rejects();
      tryResolveStub.returns('my-package');
      fakePackage.resolves(true);
      await requireWithInstall('my-package', mockGasket);

      assume(tryResolveStub()).equals('my-package');
      assume(await fakePackage()).equals(true);
    });
  });

  describe('yarn package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.resolves();
      tryResolveStub.returns(false);
      fakePackage.resolves(false);
      resolveStub.returns('my-package');
      await requireWithInstall('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('requireWithInstall - installing "my-package" with "yarn" - saving as a devDependency');
      assume(packageManagerStub.args[0][0].packageManager)
        .equals('yarn');
      assume(packageManagerExecStub.args[0][0])
        .equals('add');
      assume(packageManagerExecStub.args[0][1])
        .eqls(['my-package', '--dev']);
    });

    it('does not install when package is present', async function () {
      readFileStub.resolves();
      tryResolveStub.returns('my-package');
      fakePackage.resolves(true);
      await requireWithInstall('my-package', mockGasket);

      assume(tryResolveStub())
        .equals('my-package');
      assume(await fakePackage())
        .equals(true);
    });
  });

  describe('scoped packages', function () {

    it('allows for scoped package', async function () {
      readFileStub.rejects();
      tryResolveStub.returns(false);
      fakePackage.resolves(false);
      resolveStub.returns('@scoped/package');
      await requireWithInstall('@scoped/package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('requireWithInstall - installing "@scoped/package" with "npm" - save as a devDependency to avoid this');
      assume(packageManagerStub.args[0][0].packageManager)
        .equals('npm');
      assume(packageManagerExecStub.args[0][0])
        .equals('install');
      assume(packageManagerExecStub.args[0][1][0])
        .equals('@scoped/package');
    });

    it('does not install when scoped package is present', async function () {
      readFileStub.rejects();
      tryResolveStub.returns('@scoped/package');
      fakePackage.resolves(true);
      await requireWithInstall('@scoped/package', mockGasket);

      assume(tryResolveStub())
        .equals('@scoped/package');
      assume(await fakePackage())
        .equals(true);
    });
  });

  describe('list of packages', function () {
    it('allows for the first parameter to be an array of strings', async function () {
      const dependencies = ['my-package', '@scoped/package'];
      resolveStub.onCall(0).returns(dependencies[0]);
      resolveStub.onCall(1).returns(dependencies[1]);

      const pkgList = await requireWithInstall(dependencies, mockGasket);

      assume(Array.isArray(pkgList)).equals(true);
      assume(pkgList.length).equals(2);
    });
  });
});
