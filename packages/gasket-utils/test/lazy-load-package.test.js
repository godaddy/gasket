const proxyquire = require('proxyquire').noCallThru();;
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
  let loggerWarningStub;
  let tryResolveStub;

  beforeEach(function () {
    readFileStub = sinon.stub();
    joinStub = sinon.stub();
    packageManagerStub = sinon.stub();
    packageManagerExecStub = sinon.stub();
    fakePackage = sinon.stub();
    loggerInfoStub = sinon.stub();
    loggerWarningStub = sinon.stub();
    tryResolveStub = sinon.stub();

    mockGasket = {
      config: {
        root: '/app'
      },
      logger: {
        info: loggerInfoStub,
        warning: loggerWarningStub
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
        constructor() { packageManagerStub(...arguments) }
        exec() { packageManagerExecStub(...arguments); }
      },
      './try-resolve': tryResolveStub,
      'my-package': fakePackage
    };

    lazyLoadPackage = proxyquire('../lib/lazy-load-package', mockImports);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('npm package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.resolves(false);
      tryResolveStub.returns(false);
      fakePackage.resolves(false);
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerWarningStub.args[0][0])
        .equals('LazyLoadPackage - installing "my-package" - save as a devDependency to avoid this');
      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - Package "my-package" not found');
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
        .equals('LazyLoadPackage - Installing using npm');
      assume(loggerInfoStub.args[1][0])
        .equals('LazyLoadPackage - Package "my-package" already installed');
    });
  });

  describe('yarn package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.resolves(true);
      fakePackage.resolves(false);
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - Installing using yarn');
      assume(loggerInfoStub.args[1][0])
        .equals('LazyLoadPackage - Package "my-package" not found');
      assume(packageManagerStub.args[0][0].packageManager)
        .equals('yarn');
      assume(packageManagerExecStub.args[0][0])
        .equals('install');
      assume(packageManagerExecStub.args[0][1][0])
        .equals('my-package');
    });

    it('does not install when package is present', async function () {
      readFileStub.resolves(true);
      tryResolveStub.returns(true);
      fakePackage.resolves(true);
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerInfoStub.args[0][0])
        .equals('LazyLoadPackage - Installing using yarn');
      assume(loggerInfoStub.args[1][0])
        .equals('LazyLoadPackage - Package "my-package" already installed');
    });
  });
});
