import path from 'path';

const mockWriteStub = vi.fn();
const logStub = vi.spyOn(console, 'log');
const errorStub = vi.spyOn(console, 'error');

vi.mock('fs/promises', () => ({
  writeFile: mockWriteStub
}));

const { dumpErrorContext } = await import('../../../lib/scaffold/dump-error-context.js');

describe('dumpErrorContext', () => {
  let mockContext, mockError;

  beforeEach(() => {
    mockContext = {
      cwd: '/some/path',
      warnings: ['one', 'two'],
      errors: ['one']
    };

    mockError = new Error('mock error');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('writes log file to destination', async () => {
    mockWriteStub.mockResolvedValue();
    await dumpErrorContext(mockContext, mockError);
    expect(mockWriteStub)
      .toHaveBeenCalledWith(
        expect.stringContaining(path.join(mockContext.cwd, 'gasket-create-error.log')),
        expect.any(String),
        'utf8'
      );
  });

  it('writes context as JSON to log', async () => {
    mockWriteStub.mockResolvedValue();
    await dumpErrorContext(mockContext, mockError);

    // eslint-disable-next-line no-unused-vars
    const { exitError, ...expected } = JSON.parse(mockWriteStub.mock.calls[0][1]);

    expect(expected).toEqual(mockContext);
  });

  it('includes exit error stack in log', async () => {
    mockWriteStub.mockResolvedValue();
    await dumpErrorContext(mockContext, mockError);
    const { exitError } = JSON.parse(mockWriteStub.mock.calls[0][1]);

    expect(exitError).toEqual(mockError.stack);
  });

  it('outputs log file path to console', async () => {
    mockWriteStub.mockResolvedValue();
    await dumpErrorContext(mockContext, mockError);
    expect(logStub).toHaveBeenCalledWith(expect.stringContaining(path.join(mockContext.cwd, 'gasket-create-error.log')));
  });

  it('outputs write errors to console', async () => {
    mockWriteStub.mockRejectedValue(new Error('bad things man'));
    await dumpErrorContext(mockContext, mockError);

    expect(errorStub).toHaveBeenCalledWith(expect.stringContaining('Error writing error log'));
  });

  it('does not throw if write error', async () => {
    mockWriteStub.mockRejectedValue(new Error('bad things man'));

    let result;
    try {
      await dumpErrorContext(mockContext, mockError);
    } catch (e) {
      result = e;
    }

    expect(result).toBeUndefined();
  });
});
