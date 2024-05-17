const mockRunStub = jest.fn();

jest.mock('@gasket/utils', () => ({
  runShellCommand: mockRunStub
}));

const postCreate = require('../lib/post-create');

describe('postCreate', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      gitInit: true,
      warnings: []
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets timing to last', function () {
    expect(postCreate).toHaveProperty('timing');
    expect(postCreate.timing).toEqual({ last: true });
  });

  it('handler is async function', function () {
    expect(postCreate.handler).toEqual(expect.any(Function));
  });

  it('ignores if gitInit is false', async () => {
    mockContext.gitInit = false;
    await postCreate.handler({}, mockContext);
    expect(mockRunStub).not.toHaveBeenCalled();
  });

  it('ignores if gitInit not set', async () => {
    delete mockContext.gitInit;
    await postCreate.handler({}, mockContext);
    expect(mockRunStub).not.toHaveBeenCalled();
  });

  it('uses context dest for cwd', async () => {
    await postCreate.handler({}, mockContext);
    expect(mockRunStub).toHaveBeenCalledWith('git', ['init'], expect.objectContaining({ cwd: mockContext.dest }));
  });

  it('inits repo', async () => {
    await postCreate.handler({}, mockContext);
    expect(mockRunStub).toHaveBeenCalledWith(
      'git',
      expect.arrayContaining(['init']),
      expect.any(Object)
    );
  });

  it('checkouts \'main\' branch', async () => {
    await postCreate.handler({}, mockContext);
    expect(mockRunStub).toHaveBeenCalledWith(
      'git',
      expect.arrayContaining(['checkout', '-b', 'main']),
      expect.any(Object)
    );
  });

  it('adds files', async () => {
    await postCreate.handler({}, mockContext);
    expect(mockRunStub).toHaveBeenCalledWith(
      'git',
      expect.arrayContaining(['add', '.']),
      expect.any(Object)
    );
  });

  it('makes a git commit', async () => {
    await postCreate.handler({}, mockContext);
    expect(mockRunStub).toHaveBeenCalledWith(
      'git',
      expect.arrayContaining(['commit', '-m']),
      expect.any(Object)
    );
  });

  it('adds warning if main branch exists', async () => {
    const error = new Error('fatal: a branch named \'main\' already exists');
    error.stderr = 'fatal: a branch named \'main\' already exists';
    mockRunStub.mockRejectedValue(error);

    await postCreate.handler({}, mockContext);
    expect(mockContext.warnings).toEqual(['A branch named \'main\' already exists']);
  });

  it('adds error to warnings', async () => {
    const error = new Error('some other error');
    error.stderr = 'some other error';
    mockRunStub.mockRejectedValue(error);

    await postCreate.handler({}, mockContext);
    expect(mockContext.warnings).toEqual(['some other error']);
  });
});
