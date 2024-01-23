const mockHandlerStub = jest.fn();
const mockExecApplyStub = jest.fn();
const mockCreateEngineStub = jest.fn();

jest.mock('../../../../src/scaffold/create-engine', () => mockCreateEngineStub);
jest.mock('../../../../src/scaffold/files', () => class Files {});
const Files = require('../../../../src/scaffold/files');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');
const createHooks = require('../../../../src/scaffold/actions/create-hooks');

describe('createHooks', () => {
  let mockContext, mockPlugin;

  beforeEach(() => {
    mockHandlerStub.mockResolvedValue();
    mockCreateEngineStub.mockReturnValue({ execApply: mockExecApplyStub });

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
    await createHooks(mockContext);
    expect(mockContext.files).toBeInstanceOf(Files);
  });

  it('adds gasketConfig to context', async () => {
    await createHooks(mockContext);
    expect(mockContext.gasketConfig).toBeInstanceOf(ConfigBuilder);
  });

  it('executes the create hook with applyCreate callback', async () => {
    await createHooks(mockContext);
    expect(mockExecApplyStub).toHaveBeenCalledWith('create', expect.any(Function));
  });

  it('applyCreate callback executes handler with proxied plugin source', async () => {
    await createHooks(mockContext);
    const callbackFn = mockExecApplyStub.mock.calls[0][1];
    await callbackFn(mockPlugin, mockHandlerStub);
    expect(mockContext.runWith).toHaveBeenCalledWith(mockPlugin);
    expect(mockHandlerStub).toHaveBeenCalledWith({ ...mockPlugin, proxied: true });
  });
});
