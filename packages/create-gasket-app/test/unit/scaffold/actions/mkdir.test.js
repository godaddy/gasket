const mockMkdirStub = jest.fn();

jest.mock('fs', () => ({
  promises: {
    mkdir: mockMkdirStub
  }
}));

const mkDir = require('../../../../lib/scaffold/actions/mkdir');

describe('mkdir', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: '/some/path',
      dest: '/some/path/my-app',
      relDest: './my-app',
      extant: false,
      destOverride: true,
      errors: []
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(mkDir).toHaveProperty('wrapped');
  });

  it('Makes a directory with context.dest', async () => {
    mockMkdirStub.mockResolvedValue();
    await mkDir(mockContext);
    expect(mockMkdirStub).toHaveBeenCalledWith(mockContext.dest);
  });

  it('Rejects with message if directory was not allowed to be overwritten', async () => {
    await expect(async () => {
      await mkDir({ ...mockContext, extant: true, destOverride: false });
    }).rejects.toThrow('was not allowed to be overwritten');
  });

  it('Does not create a directory if allowed to override an existing one', async () => {
    mockMkdirStub.mockResolvedValue();
    await mkDir({ ...mockContext, extant: true, destOverride: true });
    expect(mockMkdirStub.called).toBeFalsy();
  });

  it('Rejects with original error for other issues', async () => {
    const mockError = { code: 'BOGUS' };
    mockMkdirStub.mockRejectedValue(mockError);
    await expect(async () => {
      await mkDir(mockContext);
    }).rejects.toEqual(mockError);
  });
});
