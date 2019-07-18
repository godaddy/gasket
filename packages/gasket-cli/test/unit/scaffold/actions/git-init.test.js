const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

describe('gitInit', () => {
  let sandbox, mockContext, mockImports, gitInit;
  let gitSpy, initStub, addStub, commitStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      gitInit: true
    };

    initStub = sandbox.stub();
    addStub = sandbox.stub();
    commitStub = sandbox.stub();

    mockImports = {
      '../git': class Git {
        constructor() {
          this.init = initStub;
          this.add = addStub;
          this.commit = commitStub;
        }
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    gitSpy = sandbox.spy(mockImports, '../git');

    gitInit = proxyquire('../../../../src/scaffold/actions/git-init', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(gitInit).property('wrapped');
  });

  it('instantiates Git with dest from context', async () => {
    await gitInit(mockContext);
    assume(gitSpy).is.calledWith(mockContext.dest);
  });

  it('exits of gitInit not set or false in context', async () => {
    mockContext.gitInit = false;
    await gitInit(mockContext);
    assume(gitSpy).not.calledWith(mockContext.dest);

    delete mockContext.gitInit;
    await gitInit(mockContext);
    assume(gitSpy).not.calledWith(mockContext.dest);
  });

  it('inits repo', async () => {
    await gitInit(mockContext);
    assume(initStub).is.called();
  });

  it('adds files', async () => {
    await gitInit(mockContext);
    assume(addStub).is.called();
  });

  it('makes a git commit', async () => {
    await gitInit(mockContext);
    assume(commitStub).is.called();
    assume(commitStub).is.calledWithMatch('gasket create');
  });
});
