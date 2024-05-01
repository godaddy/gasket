import { jest } from '@jest/globals';
import preset from '../lib/index.js';

describe('presetPrompt', () => {
  let presetPrompt, mockContext, mockPrompt, mockAnswers;

  beforeEach(() => {
    mockContext = {};
    mockAnswers = { typescript: false };
    mockPrompt = { prompt: jest.fn().mockImplementation(() => mockAnswers) };
    presetPrompt = preset.hooks.presetPrompt;
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
    expect(mockPrompt.prompt).not.toHaveBeenCalled();
  });

  it('prompts for typescript', async () => {
    await presetPrompt({}, mockContext, mockPrompt);
    expect(mockPrompt.prompt).toHaveBeenCalled();
  });
});
