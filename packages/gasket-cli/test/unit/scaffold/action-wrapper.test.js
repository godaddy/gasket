const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('actionWrapper', () => {
  let sandbox, mockContext, mockImports, actionWrapper;
  let mockFn, mockLabel, mockSpinner, oraStub, startStub, succeedStub, warnStub, failStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockLabel = 'mockAction';
    mockFn = () => {
    };

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      actionWrapper: true,
      warnings: [],
      errors: []
    };

    startStub = sandbox.stub();
    succeedStub = sandbox.stub();
    warnStub = sandbox.stub();
    failStub = sandbox.stub();

    mockSpinner = {
      succeed: succeedStub,
      warn: warnStub,
      fail: failStub
    };
    mockSpinner.start = () => {
      mockSpinner.isSpinning = true;
      startStub();
    };

    oraStub = sandbox.stub().returns(mockSpinner);

    mockImports = {
      ora: oraStub
    };

    actionWrapper = proxyquire('../../../src/scaffold/action-wrapper', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns a wrapped async function', () => {
    const result = actionWrapper(mockLabel, mockFn);
    assume(result).a('asyncfunction');
  });

  it('exposes wrapped function', () => {
    const result = actionWrapper(mockLabel, mockFn);
    assume(result).property('wrapped', mockFn);
  });

  describe('instance', () => {
    let mockAction;

    beforeEach(function () {
      mockAction = actionWrapper(mockLabel, mockFn);
    });

    it('instantiates spinner with label', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
      assume(oraStub).calledWith(mockLabel);
    });

    it('starts the spinner by default', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
      assume(startStub).called();
    });

    it('does not start spinner if disabled', async () => {
      mockAction = actionWrapper(mockLabel, mockFn, { startSpinner: false });
      await mockAction(mockContext);
      assume(startStub).not.called();
    });

    it('sets spinner to succeed if started', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
      assume(succeedStub).called();
    });

    it('ignores spinner succeed if not started', async () => {
      mockAction = actionWrapper(mockLabel, mockFn, { startSpinner: false });
      await mockAction(mockContext);
      assume(succeedStub).not.called();
    });

    it('sets spinner to fail if error', async () => {
      mockFn = () => {
        throw new Error('bad stuff');
      };
      mockAction = actionWrapper(mockLabel, mockFn);

      try {
        await mockAction(mockContext);
      } catch (e) {
        // continue
      }
      assume(failStub).called();
    });

    it('rethrows originating error', async () => {
      const mockError = new Error('bad stuff');
      mockFn = () => {
        throw mockError;
      };
      mockAction = actionWrapper(mockLabel, mockFn);

      try {
        await mockAction(mockContext);
      } catch (e) {
        assume(e).equals(mockError);
      }
    });

    it('adds error stack to context for reporting', async () => {
      const mockError = new Error('bad stuff');
      mockFn = () => {
        throw mockError;
      };
      mockAction = actionWrapper(mockLabel, mockFn);

      try {
        await mockAction(mockContext);
      } catch (e) {
        // continue
      }

      assume(mockContext.errors).includes(mockError.stack);
    });

    it('injects spinner to wrapped function', async () => {
      mockFn = (ctx, spinner) => {
        assume(spinner).equals(mockSpinner);
      };
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
    });
  });

});
