const mockStartStub = vi.fn();
const mockSucceedStub = vi.fn();
const mockWarnStub = vi.fn();
const mockFailStub = vi.fn();
const mockOraStub = vi.fn();

vi.mock('ora', () => ({ default: mockOraStub }));

const { withSpinner, withGasketSpinner } = await import('../../../lib/scaffold/with-spinner.js');

describe('with-spinner', () => {
  let mockContext, mockTask, mockLabel, mockSpinner;

  beforeEach(() => {
    mockLabel = 'mockAction';
    mockTask = vi.fn();

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
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

  describe('withSpinner', () => {
    it('returns a wrapped async function', () => {
      const result = withSpinner(mockLabel, mockTask);
      expect(result.constructor.name).toBe('AsyncFunction');
    });

    it('exposes the wrapped task', () => {
      const result = withSpinner(mockLabel, mockTask);
      expect(typeof result.wrapped).toBe('function');
    });

    it('instantiates spinner with label', async () => {
      const action = withSpinner(mockLabel, mockTask);
      await action({ context: mockContext });
      expect(mockOraStub).toHaveBeenCalledWith(mockLabel);
    });

    it('starts the spinner by default', async () => {
      const action = withSpinner(mockLabel, mockTask);
      await action({ context: mockContext });
      expect(mockStartStub).toHaveBeenCalled();
    });

    it('does not start spinner if disabled', async () => {
      const action = withSpinner(mockLabel, mockTask, { startSpinner: false });
      await action({ context: mockContext });
      expect(mockStartStub).not.toHaveBeenCalled();
    });

    it('passes context and spinner to the task', async () => {
      const action = withSpinner(mockLabel, mockTask);
      await action({ context: mockContext });
      expect(mockTask).toHaveBeenCalledWith({ context: mockContext, spinner: mockSpinner });
    });

    it('succeeds the spinner when started', async () => {
      const action = withSpinner(mockLabel, mockTask);
      await action({ context: mockContext });
      expect(mockSucceedStub).toHaveBeenCalled();
    });

    it('does not succeed the spinner if not started', async () => {
      const action = withSpinner(mockLabel, mockTask, { startSpinner: false });
      await action({ context: mockContext });
      expect(mockSucceedStub).not.toHaveBeenCalled();
    });

    it('fails the spinner on error', async () => {
      mockTask.mockRejectedValue(new Error('bad stuff'));
      const action = withSpinner(mockLabel, mockTask);
      await expect(action({ context: mockContext })).rejects.toThrow('bad stuff');
      expect(mockFailStub).toHaveBeenCalled();
    });

    it('rethrows the originating error', async () => {
      const mockError = new Error('bad stuff');
      mockTask.mockRejectedValue(mockError);
      const action = withSpinner(mockLabel, mockTask);
      await expect(action({ context: mockContext })).rejects.toEqual(mockError);
    });

    it('records the error stack for reporting', async () => {
      const mockError = new Error('bad stuff');
      mockTask.mockRejectedValue(mockError);
      const action = withSpinner(mockLabel, mockTask);
      await expect(action({ context: mockContext })).rejects.toThrow();
      expect(mockContext.errors).toContain(mockError.stack);
    });
  });

  describe('withGasketSpinner', () => {
    it('returns a wrapped async function', () => {
      const result = withGasketSpinner(mockLabel, mockTask);
      expect(result.constructor.name).toBe('AsyncFunction');
    });

    it('passes gasket, context, and spinner to the task', async () => {
      const mockGasket = { name: 'gasket' };
      const action = withGasketSpinner(mockLabel, mockTask);
      await action({ gasket: mockGasket, context: mockContext });
      expect(mockTask).toHaveBeenCalledWith({
        gasket: mockGasket,
        context: mockContext,
        spinner: mockSpinner
      });
    });
  });
});
