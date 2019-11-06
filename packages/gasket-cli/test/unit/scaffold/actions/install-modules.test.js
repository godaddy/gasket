const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('installModules', () => {
  let sandbox, mockContext, mockImports, installModules;
  let installStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    installStub = sandbox.stub();

    mockImports = {
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    installModules = proxyquire('../../../../src/scaffold/actions/install-modules', mockImports);

    mockContext = {
      appName: 'my-app',
      pkgManager: { install: installStub }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(installModules).property('wrapped');
  });

  it('executes install', async () => {
    await installModules(mockContext);
    assume(installStub).is.called();
  });
});
