
const mockNextServerTypePrompt = vi.fn();
const mockNextDevProxyPrompt = vi.fn();
const mockTypescriptPrompt = vi.fn();

vi.mock('@gasket/plugin-nextjs/prompts', () => ({
  default: {
    promptNextServerType: async (context, prompt) => {
      mockNextServerTypePrompt(context, prompt);
      if (prompt) await prompt();
    },
    promptNextDevProxy: async (context, prompt) => {
      mockNextDevProxyPrompt(context, prompt);
      if (prompt) await prompt();
    }
  }
}));

vi.mock('@gasket/plugin-typescript/prompts', () => ({
  default: {
    promptTypescript: async (context, prompt) => {
      mockTypescriptPrompt(context, prompt);
      if (prompt) await prompt();
    }
  }
}));

const preset = await import('../lib/index.js');

describe('presetPrompt', () => {
  let presetPrompt, mockContext, mockPrompt, mockAnswers;

  beforeEach(() => {
    mockContext = {};
    mockAnswers = { typescript: false };
    mockPrompt = { prompt: vi.fn().mockImplementation(() => mockAnswers) };
    presetPrompt = preset.default ? preset.default.hooks.presetPrompt : preset.hooks.presetPrompt;
  });

  it('is an async function', () => {
    expect(typeof presetPrompt).toBe('function');
    expect(presetPrompt.constructor.name).toBe('AsyncFunction');
  });

  it('prompts for typescript', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockTypescriptPrompt).toHaveBeenCalled();
    expect(mockPrompt.prompt).toHaveBeenCalled();
  });

  it('prompts for next server type', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockNextServerTypePrompt).toHaveBeenCalled();
    expect(mockPrompt.prompt).toHaveBeenCalled();
  });

  it('prompts for next dev proxy', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockNextDevProxyPrompt).toHaveBeenCalled();
    expect(mockPrompt.prompt).toHaveBeenCalled();
  });
});
