

const mockTypescriptPrompt = vi.fn();

vi.mock('@gasket/plugin-typescript/prompts', () => ({
  default: {
    promptTypescript: async (context, prompt) => {
      mockTypescriptPrompt(context, prompt);
      if (prompt) await prompt();
    }
  }
}));

const mockSwaggerPrompt = vi.fn();

vi.mock('@gasket/plugin-swagger/prompts', () => ({
  default: {
    promptSwagger: async (context, prompt) => {
      mockSwaggerPrompt(context, prompt);
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is an async function', () => {
    expect(typeof presetPrompt).toBe('function');
    expect(presetPrompt.constructor.name).toBe('AsyncFunction');
  });

  it('set context.apiApp to true', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockContext).toHaveProperty('apiApp', true);
  });

  it('does not prompt if context.typescript exists', async () => {
    mockContext.typescript = true;
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockPrompt.prompt).not.toHaveBeenCalledWith([
      expect.objectContaining({ name: 'typescript' })
    ]);
  });

  it('prompts for typescript', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockTypescriptPrompt).toHaveBeenCalled();
  });

  it('prompts for swagger', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockSwaggerPrompt).toHaveBeenCalled();
  });

  it('prompts for server framework', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockPrompt.prompt).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'server' })
    ]);
  });
});
