const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');

describe('dumpErrorContext', () => {
  let sandbox, mockContext, dumpErrorContext;
  let mockError, writeStub, logStub, errorStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      cwd: '/some/path',
      warnings: ['one', 'two'],
      errors: ['one']
    };

    mockError = new Error('mock error');

    writeStub = sandbox.stub();
    logStub = sandbox.stub(console, 'log');
    errorStub = sandbox.stub(console, 'error');

    dumpErrorContext = proxyquire('../../../src/scaffold/dump-error-context', {
      fs: {
        promises: {
          writeFile: writeStub
        }
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('writes log file to destination', async () => {
    writeStub.resolves();
    await dumpErrorContext(mockContext, mockError);
    assume(writeStub).calledWith(path.join(mockContext.cwd, 'gasket-create-error.log'));
  });

  it('writes context as JSON to log', async () => {
    writeStub.resolves();
    await dumpErrorContext(mockContext, mockError);

    // eslint-disable-next-line no-unused-vars
    const { exitError, ...expected } = JSON.parse(writeStub.args[0][1]);

    assume(expected).eqls(mockContext);
  });

  it('includes exit error stack in log', async () => {
    writeStub.resolves();
    await dumpErrorContext(mockContext, mockError);
    const { exitError } = JSON.parse(writeStub.args[0][1]);

    assume(exitError).eqls(mockError.stack);
  });

  it('outputs log file path to console', async () => {
    writeStub.resolves();
    await dumpErrorContext(mockContext, mockError);

    assume(logStub).calledWithMatch(path.join(mockContext.cwd, 'gasket-create-error.log'));
  });

  it('outputs write errors to console', async () => {
    writeStub.rejects(new Error('bad things man'));
    await dumpErrorContext(mockContext, mockError);

    assume(errorStub).calledWithMatch('Error writing error log');
  });

  it('does not throw if write error', async () => {
    writeStub.rejects(new Error('bad things man'));

    let result;
    try {
      await dumpErrorContext(mockContext, mockError);
    } catch (e) {
      result = e;
    }

    assume(result).undefined();
  });
});
