const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('installModules', () => {
  let sandbox, mockContext, mockImports, installModules;
  let installStub, packageManagerSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    installStub = sandbox.stub();

    mockImports = {
      '../package-manager': class PackageManager {
        constructor() {
          this.install = installStub;
        }
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    packageManagerSpy = sandbox.spy(mockImports, '../package-manager');

    installModules = proxyquire('../../../../src/scaffold/actions/install-modules', mockImports);

    mockContext = {
      appName: 'my-app'
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(installModules).property('wrapped');
  });

  it('instantiates PackageManager with context', async () => {
    await installModules(mockContext);
    assume(packageManagerSpy).is.calledWith(mockContext);
  });
});
