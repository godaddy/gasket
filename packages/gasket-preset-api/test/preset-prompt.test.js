import { jest } from '@jest/globals';

const mockTypescriptPrompt = jest.fn();

jest.mock('@gasket/plugin-typescript/prompts', () => {
  const mod = jest.requireActual('@gasket/plugin-typescript/prompts');
  return {
    promptTypescript: async (context, prompt) => {
      mod.promptTypescript(context, prompt);
      mockTypescriptPrompt(context, prompt);
    }
  };
});

const mockSwaggerPrompt = jest.fn();

jest.mock('@gasket/plugin-swagger/prompts', () => {
  const mod = jest.requireActual('@gasket/plugin-swagger/prompts');
  return {
    promptSwagger: async (context, prompt) => {
      mod.promptSwagger(context, prompt);
      mockSwaggerPrompt(context, prompt);
    }
  };
});

const preset = await import('../lib/index.js');

describe('presetPrompt', () => {
  let presetPrompt, mockContext, mockPrompt, mockAnswers;

  beforeEach(() => {
    mockContext = {};
    mockAnswers = { typescript: false };
    mockPrompt = { prompt: jest.fn().mockImplementation(() => mockAnswers) };
    presetPrompt = preset.default ? preset.default.hooks.presetPrompt : preset.hooks.presetPrompt;
  });

  afterEach(() => {
    jest.clearAllMocks();
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
