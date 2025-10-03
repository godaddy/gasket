const mockRunShellCommand = vi.fn();

vi.mock('@gasket/utils', () => ({
  runShellCommand: mockRunShellCommand
}));

const gitInit = (await import('../../../../lib/scaffold/actions/git-init.js')).default;

describe('gitInit', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      dest: '/path/to/test-app'
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', () => {
    expect(gitInit).toHaveProperty('wrapped');
  });

  it('initializes git repository with main branch', async () => {
    mockRunShellCommand.mockResolvedValue();

    await gitInit({ context: mockContext });

    expect(mockRunShellCommand).toHaveBeenCalledTimes(4);
    expect(mockRunShellCommand).toHaveBeenNthCalledWith(
      1,
      'git',
      ['init'],
      { cwd: '/path/to/test-app' }
    );
    expect(mockRunShellCommand).toHaveBeenNthCalledWith(
      2,
      'git',
      ['checkout', '-b', 'main'],
      { cwd: '/path/to/test-app' }
    );
    expect(mockRunShellCommand).toHaveBeenNthCalledWith(
      3,
      'git',
      ['add', '.'],
      { cwd: '/path/to/test-app' }
    );
    expect(mockRunShellCommand).toHaveBeenNthCalledWith(
      4,
      'git',
      ['commit', '-m', ':tada: Created new repository with gasket create'],
      { cwd: '/path/to/test-app' }
    );
  });

  it('handles git init failure', async () => {
    const error = new Error('Git not installed');
    mockRunShellCommand.mockRejectedValueOnce(error);

    await expect(gitInit({ context: mockContext }))
      .rejects.toThrow('Git not installed');

    expect(mockRunShellCommand).toHaveBeenCalledTimes(1);
  });

  it('handles git checkout failure', async () => {
    const error = new Error('Failed to create branch');
    mockRunShellCommand
      .mockResolvedValueOnce() // git init succeeds
      .mockRejectedValueOnce(error); // checkout fails

    await expect(gitInit({ context: mockContext }))
      .rejects.toThrow('Failed to create branch');

    expect(mockRunShellCommand).toHaveBeenCalledTimes(2);
  });

  it('handles git add failure', async () => {
    const error = new Error('Failed to add files');
    mockRunShellCommand
      .mockResolvedValueOnce() // git init succeeds
      .mockResolvedValueOnce() // checkout succeeds
      .mockRejectedValueOnce(error); // add fails

    await expect(gitInit({ context: mockContext }))
      .rejects.toThrow('Failed to add files');

    expect(mockRunShellCommand).toHaveBeenCalledTimes(3);
  });

  it('handles git commit failure', async () => {
    const error = new Error('Failed to commit');
    mockRunShellCommand
      .mockResolvedValueOnce() // git init succeeds
      .mockResolvedValueOnce() // checkout succeeds
      .mockResolvedValueOnce() // add succeeds
      .mockRejectedValueOnce(error); // commit fails

    await expect(gitInit({ context: mockContext }))
      .rejects.toThrow('Failed to commit');

    expect(mockRunShellCommand).toHaveBeenCalledTimes(4);
  });

  it('uses correct directory from context', async () => {
    mockContext.dest = '/different/path/to/my-app';
    mockRunShellCommand.mockResolvedValue();

    await gitInit({ context: mockContext });

    expect(mockRunShellCommand).toHaveBeenCalledWith(
      'git',
      ['init'],
      { cwd: '/different/path/to/my-app' }
    );
    expect(mockRunShellCommand).toHaveBeenCalledWith(
      'git',
      ['checkout', '-b', 'main'],
      { cwd: '/different/path/to/my-app' }
    );
    expect(mockRunShellCommand).toHaveBeenCalledWith(
      'git',
      ['add', '.'],
      { cwd: '/different/path/to/my-app' }
    );
    expect(mockRunShellCommand).toHaveBeenCalledWith(
      'git',
      ['commit', '-m', ':tada: Created new repository with gasket create'],
      { cwd: '/different/path/to/my-app' }
    );
  });
});

