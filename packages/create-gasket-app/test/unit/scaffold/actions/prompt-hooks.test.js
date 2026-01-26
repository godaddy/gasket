
const mockExecWaterfallStub = vi.fn();
const mockInstallStub = vi.fn();
const mockLinkStub = vi.fn();
const mockPromptStub = vi.fn();
const mockCreatePromptModuleStub = vi.fn();

vi.mock('inquirer', () => ({ default: { createPromptModule: mockCreatePromptModuleStub } }));

const { ConfigBuilder } = await import('../../../../lib/scaffold/config-builder.js');
const promptHooks = (await import('../../../../lib/scaffold/actions/prompt-hooks')).default;

describe('promptHooks', () => {
  let mockGasket, mockContext;

  beforeEach(() => {
    mockExecWaterfallStub.mockResolvedValue();
    mockCreatePromptModuleStub.mockReturnValue(mockPromptStub);

    mockGasket = { execWaterfall: mockExecWaterfallStub };
    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      template: '@gasket/template-test',
      plugins: ['gasket-plugin-bogus-A', 'gasket-plugin-bogus-B'],
      pkg: ConfigBuilder.createPackageJson({
        name: 'my-app',
        version: '0.0.0'
      }),
      pkgManager: {
        install: mockInstallStub,
        link: mockLinkStub,
        info: vi.fn().mockImplementation(() => ({ data: '7.8.9-faked' }))
      },
      prompts: true
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(promptHooks).toHaveProperty('wrapped');
  });

  it('executes the plugin prompt hook with context', async () => {
    await promptHooks({ gasket: mockGasket, context: mockContext });
    expect(mockExecWaterfallStub).toHaveBeenCalledWith('prompt', mockContext, expect.any(Object));
  });

  it('executes the plugin prompt hook with `prompt` util', async () => {
    await promptHooks({ gasket: mockGasket, context: mockContext });
    expect(mockExecWaterfallStub.mock.calls[0][2]).toHaveProperty('prompt', mockPromptStub);
  });

  it('does not execute the plugin prompt hook with --no-prompts option', async () => {
    mockContext.prompts = false;
    await promptHooks({ gasket: mockGasket, context: mockContext });
    expect(typeof mockExecWaterfallStub.mock.calls[0][2].prompt).toEqual('function');
    expect(mockExecWaterfallStub.mock.calls[0][2].prompt).not.toEqual(mockPromptStub);
  });
});
