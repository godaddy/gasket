const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');


describe('createHooks', () => {
  let sandbox, mockImports, mockContext, mockPlugin, createHooks;
  let engineStub, execApplyStub, handlerStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockPlugin = { name: 'mockPlugin' };
    handlerStub = sandbox.stub().resolves();
    execApplyStub = sandbox.stub().callsArgWithAsync(1, mockPlugin, handlerStub);

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      presets: ['bogus-preset'],
      plugins: ['bogus-A-plugin', 'bogus-B-plugin'],
      pkg: {},
      runWith(source) {
        this.source = source;
        return this;
      }
    };

    engineStub = sandbox.stub().returns({ execApply: execApplyStub });

    mockImports = {
      '../create-engine': engineStub,
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

  it('executes the create hook for plugins with context', async () => {
    await createHooks(mockContext);
    assume(execApplyStub).is.calledWithMatch('create', handlerStub);
    assume(handlerStub).is.calledWithMatch(mockContext);
  });

  it('sets plugin as `context.source`', async () => {
    await createHooks(mockContext);
    assume(mockContext.source).eqls(mockPlugin);
  });
});
