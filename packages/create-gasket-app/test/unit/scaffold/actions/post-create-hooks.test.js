const mockExecStub = vi.fn();

const postCreateHooks = (await import('../../../../lib/scaffold/actions/post-create-hooks.js')).default;

describe('postCreateHooks', () => {
  let mockContext, mockGasket;

  beforeEach(() => {
    mockGasket = {
      exec: mockExecStub
    };
    mockContext = {
      dest: '/some/path/my-app',
      plugins: ['the-wurst-plugin', 'loaf-me-alone']
    };

    mockExecStub.mockResolvedValue();
  });

  it('is decorated action', async () => {
    expect(postCreateHooks).toHaveProperty('wrapped');
  });

  it('executes the postCreate hook for plugins with context', async () => {
    await postCreateHooks({ gasket: mockGasket, context: mockContext });
    expect(mockExecStub).toHaveBeenCalledWith('postCreate', mockContext, { runScript: expect.any(Function) });
    expect(mockExecStub.mock.lastCall[2]).toHaveProperty('runScript');
  });
});
