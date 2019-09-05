const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');


describe('createHooks', () => {
  let sandbox, mockImports, mockContext, mockPlugin, createHooks;
  let createEngineStub, execApplyStub, handlerStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockPlugin = { name: 'mockPlugin' };
    handlerStub = sandbox.stub().resolves();
    execApplyStub = sandbox.stub();

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      presets: ['bogus-preset'],
      plugins: ['bogus-A-plugin', 'bogus-B-plugin'],
      pkg: {},
      runWith: sinon.stub().callsFake(plugin => ({ ...plugin, proxied: true }))
    };

    createEngineStub = sandbox.stub().returns({ execApply: execApplyStub });

    mockImports = {
      '../create-engine': createEngineStub,
      '../files': class Files {
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };


    createHooks = proxyquire('../../../../src/scaffold/actions/create-hooks', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(createHooks).property('wrapped');
  });

  it('adds files to context', async () => {
    await createHooks(mockContext);
    assume(mockContext.files).to.be.instanceOf(mockImports['../files']);
  });

  it('adds gasketConfig to context', async () => {
    await createHooks(mockContext);
    assume(mockContext.gasketConfig).is.instanceOf(ConfigBuilder);
  });

  it('executes the create hook with applyCreate callback', async () => {
    await createHooks(mockContext);
    assume(execApplyStub).is.calledWithMatch('create', sinon.match(value => {
      return typeof value === 'function' && value.name === 'applyCreate';
    }));
  });

  it('applyCreate callback executes handler with proxied plugin source', async () => {
    await createHooks(mockContext);
    const callbackFn = execApplyStub.getCall(0).args[1];
    await callbackFn(mockPlugin, handlerStub);
    assume(mockContext.runWith).calledWith(mockPlugin);
    assume(handlerStub).calledWithMatch({ ...mockPlugin, proxied: true });
  });
});
