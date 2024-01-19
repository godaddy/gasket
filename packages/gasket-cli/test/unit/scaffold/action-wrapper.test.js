const mockStartStub = jest.fn();
const mockSucceedStub = jest.fn();
const mockWarnStub = jest.fn();
const mockFailStub = jest.fn();
const mockOraStub = jest.fn();

jest.mock('ora', () => mockOraStub);

const actionWrapper = require('../../../src/scaffold/action-wrapper');

describe('actionWrapper', () => {
  let mockContext, mockFn, mockLabel, mockSpinner;

  beforeEach(() => {
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

    mockSpinner = {
      succeed: mockSucceedStub,
      warn: mockWarnStub,
      fail: mockFailStub
    };
    mockSpinner.start = () => {
      mockSpinner.isSpinning = true;
      mockStartStub();
    };

    mockOraStub.mockReturnValue(mockSpinner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a wrapped async function', () => {
    const result = actionWrapper(mockLabel, mockFn);
    expect(result.constructor.name).toBe('AsyncFunction');
  });

  it('exposes wrapped function', () => {
    const result = actionWrapper(mockLabel, mockFn);
    expect(result).toHaveProperty('wrapped', mockFn);
  });

  describe('instance', () => {
    let mockAction;

    beforeEach(function () {
      mockAction = actionWrapper(mockLabel, mockFn);
    });

    it('instantiates spinner with label', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
      expect(mockOraStub).toHaveBeenCalledWith(mockLabel);
    });

    it('starts the spinner by default', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
      expect(mockStartStub).toHaveBeenCalled();
    });

    it('does not start spinner if disabled', async () => {
      mockAction = actionWrapper(mockLabel, mockFn, { startSpinner: false });
      await mockAction(mockContext);
      expect(mockStartStub).not.toHaveBeenCalled();
    });

    it('sets spinner to succeed if started', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
      expect(mockSucceedStub).toHaveBeenCalled();
    });

    it('ignores spinner succeed if not started', async () => {
      mockAction = actionWrapper(mockLabel, mockFn, { startSpinner: false });
      await mockAction(mockContext);
      expect(mockSucceedStub).not.toHaveBeenCalled();
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
      expect(mockFailStub).toHaveBeenCalled();
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
        expect(e).toEqual(mockError);
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

      expect(mockContext.errors).toContain(mockError.stack);
    });

    it('injects spinner to wrapped function', async () => {
      mockFn = (ctx, spinner) => {
        expect(spinner).toEqual(mockSpinner);
      };
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction(mockContext);
    });
  });

});
