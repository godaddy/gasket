import { jest } from '@jest/globals';
const mockHandlerStub = jest.fn();
const mockExecApplyStub = jest.fn();

jest.unstable_mockModule('../../../../lib/scaffold/files.js', () => ({ Files: class Files { } }));

const { Files } = await import('../../../../lib/scaffold/files.js');
const { ConfigBuilder } = await import('../../../../lib/scaffold/config-builder.js');
const createHooks = (await import('../../../../lib/scaffold/actions/create-hooks.js')).default;

describe('createHooks', () => {
  let mockContext, mockPlugin, mockGasket;

  beforeEach(() => {
    mockHandlerStub.mockResolvedValue();
    mockGasket = {
      execApply: mockExecApplyStub
    };
    mockPlugin = { name: 'mockPlugin' };
    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      presets: ['bogus-preset'],
      plugins: ['bogus-A-plugin', 'bogus-B-plugin'],
      pkg: {},
      runWith: jest.fn().mockImplementation(plugin => ({ ...plugin, proxied: true }))
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(createHooks).toHaveProperty('wrapped');
  });

  it('adds files to context', async () => {
    await createHooks(mockGasket, mockContext);
    expect(mockContext.files).toBeInstanceOf(Files);
  });

  it('adds gasketConfig to context', async () => {
    await createHooks(mockGasket, mockContext);
    expect(mockContext.gasketConfig).toBeInstanceOf(ConfigBuilder);
  });

  it('executes the create hook with applyCreate callback', async () => {
    await createHooks(mockGasket, mockContext);
    expect(mockExecApplyStub).toHaveBeenCalledWith('create', expect.any(Function));
  });

  it('applyCreate callback executes handler with proxied plugin source', async () => {
    await createHooks(mockGasket, mockContext);
    const callbackFn = mockExecApplyStub.mock.calls[0][1];
    await callbackFn(mockPlugin, mockHandlerStub);
    expect(mockContext.runWith).toHaveBeenCalledWith(mockPlugin);
    expect(mockHandlerStub).toHaveBeenCalledWith({ ...mockPlugin, proxied: true });
  });
});
