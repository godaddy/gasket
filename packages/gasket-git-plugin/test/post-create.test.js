const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

describe('postCreate', () => {
  let sandbox, mockContext, mockImports, postCreate;
  let runStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      gitInit: true
    };

    runStub = sandbox.stub();

    mockImports = {
      '@gasket/utils': {
        runShellCommand: runStub
      }
    };

    postCreate = proxyquire('../lib/post-create', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is async function', function () {
    assume(postCreate).to.be.an('asyncfunction');
  });

  it('ignores if gitInit is false', async () => {
    mockContext.gitInit = false;
    await postCreate({}, mockContext);
    assume(runStub).not.called();
  });

  it('ignores if gitInit not set', async () => {
    delete mockContext.gitInit;
    await postCreate({}, mockContext);
    assume(runStub).not.called();
  });

  it('uses context dest for cwd', async () => {
    await postCreate({}, mockContext);
    assume(runStub).is.calledWithMatch('git', ['init'], sinon.match({ cwd: mockContext.dest }));
  });

  it('inits repo', async () => {
    await postCreate({}, mockContext);
    assume(runStub).is.calledWithMatch('git', ['init']);
  });

  it('adds files', async () => {
    await postCreate({}, mockContext);
    assume(runStub).is.calledWithMatch('git', ['add', '.']);
  });

  it('makes a git commit', async () => {
    await postCreate({}, mockContext);
    assume(runStub).is.calledWithMatch('git', ['commit', '-m', sinon.match.string]);
  });
});
