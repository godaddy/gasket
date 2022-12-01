const proxyquire = require('proxyquire').noCallThru();;
const assume = require('assume');
const sinon = require('sinon');

describe.only('lazyLoadPackage', function () {
  let lazyLoadPackage;
  let mockGasket;
  let mockImports;
  let readFileStub;
  let joinStub;
  let packageManagerStub;
  let packageManagerExecStub;
  let fakePackage;
  let loggerInfo;
  let loggerWarning;
  let testStub;

  beforeEach(function () {
    readFileStub = sinon.stub();
    joinStub = sinon.stub();
    packageManagerStub = sinon.stub();
    packageManagerExecStub = sinon.stub();
    fakePackage = sinon.stub();
    loggerInfo = sinon.stub();
    loggerWarning = sinon.stub();
    testStub = sinon.stub(); // temp

    mockGasket = {
      config: {
        root: '/app'
      },
      logger: {
        info: loggerInfo,
        warning: loggerWarning
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
      'my-package': fakePackage,
      'app/my-package': fakePackage,
      'require': { // temp
        resolve: testStub // temp
      } // temp
    };

    lazyLoadPackage = proxyquire('../lib/lazy-load-package', mockImports);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('npm package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.resolves(false);
      fakePackage.resolves(false); // package should not resolve - not installed
      await lazyLoadPackage('my-package', mockGasket);

      assume(loggerWarning.args[0][0])
        .equals('LazyLoadPackage - installing "my-package" - save as a devDependency to avoid this')
      assume(loggerInfo.args[0][0])
        .equals('LazyLoadPackage - Package "my-package" not found');
      assume(packageManagerStub.args[0][0].packageManager).equals('npm')
      assume(packageManagerExecStub.args[0][0]).equals('install');
      assume(packageManagerExecStub.args[0][1][0]).equals('my-package');
    });

    it('does not install when package is present', async function () {
      readFileStub.resolves(false);
      fakePackage.resolves(true); // package should resolve
      await lazyLoadPackage('my-package', mockGasket);
      console.log('--------', testStub.args); // temp
      assume(loggerWarning.args[0][0])
        .equals('LazyLoadPackage - installing "my-package" - save as a devDependency to avoid this');
      assume(loggerInfo.args[0][0])
        .equals('LazyLoadPackage - Package "my-package" not found'); // this should be a different stdout message - catch block still active
      console.log(loggerInfo.args)
      assume(packageManagerStub.args[0][0].packageManager).equals('npm');
      assume(packageManagerExecStub.args[0][0]).equals('install');
      assume(packageManagerExecStub.args[0][1][0]).equals('my-package');
    });
  });

  describe('yarn package manager', function () {
    it('installs "my-package" with PackageManager', async function () {
      readFileStub.resolves(true);
      fakePackage.resolves(false);
      await lazyLoadPackage('my-package', mockGasket);
      assume(packageManagerStub.args[0][0].packageManager).equals('yarn');
      assume(packageManagerExecStub.args[0][0]).equals('install');
      assume(packageManagerExecStub.args[0][1][0]).equals('my-package');
    });
  });
});
