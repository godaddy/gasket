import { jest } from '@jest/globals';

const mockExecWaterfallStub = jest.fn();
const mockInstallStub = jest.fn();
const mockLinkStub = jest.fn();
const mockPromptStub = jest.fn();
const mockCreatePromptModuleStub = jest.fn();

jest.mock('inquirer', () => ({ createPromptModule: mockCreatePromptModuleStub }));

const { ConfigBuilder } = await import('../../../../lib/scaffold/config-builder.js');
const promptHooks = (await import('../../../../lib/scaffold/actions/prompt-hooks')).default;

describe('promptHooks', () => {
  let mockGasket, mockContext, pkgAddSpy;

  beforeEach(() => {
    mockExecWaterfallStub.mockResolvedValue();
    mockCreatePromptModuleStub.mockReturnValue(mockPromptStub);

    mockGasket = { execWaterfall: mockExecWaterfallStub };
    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      presets: ['gasket-preset-bogus'],
      plugins: ['gasket-plugin-bogus-A', 'gasket-plugin-bogus-B'],
      pkg: ConfigBuilder.createPackageJson({
        name: 'my-app',
        version: '0.0.0'
      }),
      pkgManager: {
        install: mockInstallStub,
        link: mockLinkStub,
        info: jest.fn().mockImplementation(() => ({ data: '7.8.9-faked' }))
      },
      prompts: true
    };

    pkgAddSpy = jest.spyOn(mockContext.pkg, 'add');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(promptHooks).toHaveProperty('wrapped');
  });

  it('executes the plugin prompt hook with context', async () => {
    await promptHooks(mockGasket, mockContext);
    expect(mockExecWaterfallStub).toHaveBeenCalledWith('prompt', mockContext, expect.any(Object));
  });

  it('executes the plugin prompt hook with `prompt` util', async () => {
    await promptHooks(mockGasket, mockContext);
    expect(mockExecWaterfallStub.mock.calls[0][2]).toHaveProperty('prompt', mockPromptStub);
  });

  it('does not execute the plugin prompt hook with --no-prompts', async () => {
    mockContext.prompts = false;
    await promptHooks(mockGasket, mockContext);
    expect(typeof mockExecWaterfallStub.mock.calls[0][2].prompt).toEqual('function');
    expect(mockExecWaterfallStub.mock.calls[0][2].prompt).not.toEqual(mockPromptStub);
  });
});
