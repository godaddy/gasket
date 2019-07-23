/* eslint no-unused-vars: 0 */
const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('Git', () => {
  let sandbox, mockGit, mockImports;
  let runStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    runStub = sandbox.stub();

    mockImports = {
      '@gasket/utils': {
        runShellCommand: runStub
      }
    };

    const Git = proxyquire('../../../src/scaffold/git', mockImports);

    mockGit = new Git('/some/dest');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('sets the cwd to dest', () => {
    assume(mockGit).property('cwd', '/some/dest');
  });

  it('.init() - runs "git init"', () => {
    mockGit.init();
    assume(runStub).is.calledWithMatch('git', ['init']);
  });

  it('.add() - runs "git add ."', () => {
    mockGit.add();
    assume(runStub).is.calledWithMatch('git', ['add', '.']);
  });

  it('.commit(message) - runs "git commit" with message argument', () => {
    mockGit.commit('some message');
    assume(runStub).is.calledWithMatch('git', ['commit', '-m', 'some message']);
  });
});
