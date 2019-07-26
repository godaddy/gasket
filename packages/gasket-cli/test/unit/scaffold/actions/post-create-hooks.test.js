const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('postCreateHooks', () => {
  let sandbox, mockImports, mockContext, postCreateHooks;
  let engineStub, execStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    execStub = sandbox.stub().resolves();
    mockContext = {
      dest: '/some/path/my-app',
      presets: ['charcuterie-preset'],
      plugins: ['the-wurst-plugin', 'loaf-me-alone']
    };

    engineStub = sandbox.stub().returns({ exec: execStub });

    mockImports = {
      '../create-engine': engineStub,
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    postCreateHooks = proxyquire('../../../../src/scaffold/actions/post-create-hooks', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(postCreateHooks).property('wrapped');
  });

  it('executes the postCreate hook for plugins with context', async () => {
    await postCreateHooks(mockContext);
    assume(execStub).is.calledWithMatch('postCreate', mockContext);
    assume(execStub.lastCall.lastArg).contains('runScript');
  });
});
