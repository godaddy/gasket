const mockEngineStub = jest.fn();
const mockExecStub = jest.fn();

jest.mock('../../../../src/scaffold/create-engine', () => mockEngineStub);

const postCreateHooks = require('../../../../src/scaffold/actions/post-create-hooks');

describe('postCreateHooks', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      dest: '/some/path/my-app',
      presets: ['charcuterie-preset'],
      plugins: ['the-wurst-plugin', 'loaf-me-alone']
    };

    mockExecStub.mockResolvedValue();
    mockEngineStub.mockReturnValue({ exec: mockExecStub });
  });

  it('is decorated action', async () => {
    expect(postCreateHooks).toHaveProperty('wrapped');
  });

  it('executes the postCreate hook for plugins with context', async () => {
    await postCreateHooks(mockContext);
    expect(mockExecStub).toHaveBeenCalledWith('postCreate', mockContext, { runScript: expect.any(Function) });
    expect(mockExecStub.mock.lastCall[2]).toHaveProperty('runScript');
  });
});
