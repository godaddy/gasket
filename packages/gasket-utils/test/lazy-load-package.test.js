const proxyquire = require('proxyquire').noCallThru();
const assume = require('assume');
const sinon = require('sinon');

describe('lazyLoadPackage', function () {
  let lazyLoadPackage;
  let mockGasket;
  let mockImports;
  let readFileStub;
  let joinStub;
  let packageManagerStub;
  let packageManagerExecStub;
  let fakePackage;
  let loggerInfoStub;
  let tryResolveStub;

  beforeEach(function () {
    readFileStub = sinon.stub();
    joinStub = sinon.stub();
    packageManagerStub = sinon.stub();
    packageManagerExecStub = sinon.stub();
    fakePackage = sinon.stub();
    loggerInfoStub = sinon.stub();
    tryResolveStub = sinon.stub();

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
      './try-resolve': tryResolveStub,
      'my-package': fakePackage,
      '@scoped/package': fakePackage
    };

    lazyLoadPackage = proxyquire('../lib/lazy-load-package', mockImports);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('npm package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.rejects();
      tryResolveStub.returns(false);
      fakePackage.resolves(false);
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - installing "my-package" with "npm" - save as a devDependency to avoid this');
      assume(packageManagerStub.args[0][0].packageManager)
        .equals('npm');
      assume(packageManagerExecStub.args[0][0])
        .equals('install');
      assume(packageManagerExecStub.args[0][1][0])
        .equals('my-package');
    });

    it('does not install when package is present', async function () {
      readFileStub.rejects();
      tryResolveStub.returns(true);
      fakePackage.resolves(true);
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - Package "my-package" already installed');
    });
  });

  describe('yarn package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.resolves();
      fakePackage.resolves(false);
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - installing "my-package" with "yarn" - save as a devDependency to avoid this');
      assume(packageManagerStub.args[0][0].packageManager)
        .equals('yarn');
      assume(packageManagerExecStub.args[0][0])
        .equals('install');
      assume(packageManagerExecStub.args[0][1][0])
        .equals('my-package');
    });

    it('does not install when package is present', async function () {
      readFileStub.resolves();
      tryResolveStub.returns(true);
      fakePackage.resolves(true);
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - Package "my-package" already installed');
    });
  });

  describe('scoped packages', function () {

    it('allows for scoped package', async function () {
      readFileStub.rejects();
      tryResolveStub.returns(false);
      fakePackage.resolves(false);
      await lazyLoadPackage('@scoped/package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - installing "@scoped/package" with "npm" - save as a devDependency to avoid this');
      assume(packageManagerStub.args[0][0].packageManager)
        .equals('npm');
      assume(packageManagerExecStub.args[0][0])
        .equals('install');
      assume(packageManagerExecStub.args[0][1][0])
        .equals('@scoped/package');
    });

    it('does not install when scoped package is present', async function () {
      readFileStub.rejects();
      tryResolveStub.returns(true);
      fakePackage.resolves(true);
      await lazyLoadPackage('@scoped/package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - Package "@scoped/package" already installed');
    });
  });
});
