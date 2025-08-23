const mockStartStub = vi.fn();
const mockSucceedStub = vi.fn();
const mockWarnStub = vi.fn();
const mockFailStub = vi.fn();
const mockOraStub = vi.fn();

vi.mock('ora', () => mockOraStub);

const actionWrapper = (await import('../../../lib/scaffold/with-spinner.js')).default;

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
    vi.clearAllMocks();
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
      await mockAction({ context: mockContext });
      expect(mockOraStub).toHaveBeenCalledWith(mockLabel);
    });

    it('starts the spinner by default', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction({ context: mockContext });
      expect(mockStartStub).toHaveBeenCalled();
    });

    it('does not start spinner if disabled', async () => {
      mockAction = actionWrapper(mockLabel, mockFn, { startSpinner: false });
      await mockAction({ context: mockContext });
      expect(mockStartStub).not.toHaveBeenCalled();
    });

    it('sets spinner to succeed if started', async () => {
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction({ context: mockContext });
      expect(mockSucceedStub).toHaveBeenCalled();
    });

    it('ignores spinner succeed if not started', async () => {
      mockAction = actionWrapper(mockLabel, mockFn, { startSpinner: false });
      await mockAction({ context: mockContext });
      expect(mockSucceedStub).not.toHaveBeenCalled();
    });

    it('sets spinner to fail if error', async () => {
      mockFn = () => {
        throw new Error('bad stuff');
      };
      mockAction = actionWrapper(mockLabel, mockFn);

      try {
        await mockAction({ context: mockContext });
      } catch {
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
      await expect(async () => {
        await mockAction({ context: mockContext });
      }).rejects.toEqual(mockError);
    });

    it('adds error stack to context for reporting', async () => {
      const mockError = new Error('bad stuff');
      mockFn = () => {
        throw mockError;
      };
      mockAction = actionWrapper(mockLabel, mockFn);

      try {
        await mockAction({ context: mockContext });
      } catch {
        // continue
      }

      expect(mockContext.errors).toContain(mockError.stack);
    });

    it('injects spinner to wrapped function', async () => {
      mockFn = ({ spinner }) => {
        expect(spinner).toEqual(mockSpinner);
      };
      mockAction = actionWrapper(mockLabel, mockFn);
      await mockAction({ context: mockContext });
    });
  });

});
