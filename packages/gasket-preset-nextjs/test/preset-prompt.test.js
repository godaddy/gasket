import { jest } from '@jest/globals';

const mockNextServerTypePrompt = jest.fn();
const mockNextDevProxyPrompt = jest.fn();
const mockTypescriptPrompt = jest.fn();

jest.mock('@gasket/plugin-nextjs/prompts', () => {
  const mod = jest.requireActual('@gasket/plugin-nextjs/prompts');
  return {
    promptNextServerType: async (context, prompt) => {
      mod.promptNextServerType(context, prompt);
      mockNextServerTypePrompt(context, prompt);
    },
    promptNextDevProxy: async (context, prompt) => {
      mod.promptNextDevProxy(context, prompt);
      mockNextDevProxyPrompt(context, prompt);
    }
  };
});

jest.mock('@gasket/plugin-typescript/prompts', () => {
  const mod = jest.requireActual('@gasket/plugin-typescript/prompts');
  return {
    promptTypescript: async (context, prompt) => {
      mod.promptTypescript(context, prompt);
      mockTypescriptPrompt(context, prompt);
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

  it('prompts for server if nextServerType is customServer', async () => {
    mockContext.nextServerType = 'customServer';
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockPrompt.prompt).toHaveBeenCalledWith([
      {
        name: 'server',
        message: 'Which custom server framework would you like to use?',
        type: 'list',
        choices: [
          { name: 'Express', value: 'express' },
          { name: 'Fastify', value: 'fastify' }
        ]
      }
    ]);
  });

  it('does not prompt for server if nextServerType is not customServer', async () => {
    mockContext.nextServerType = 'defaultServer';
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockPrompt.prompt).not.toHaveBeenCalledWith([
      {
        name: 'server',
        message: 'Which server framework would you like to use?',
        type: 'list',
        choices: [
          { name: 'Express', value: 'express' },
          { name: 'Fastify', value: 'fastify' }
        ]
      }
    ]);
  });
});
