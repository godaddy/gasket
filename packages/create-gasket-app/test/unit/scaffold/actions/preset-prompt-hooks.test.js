import { jest } from '@jest/globals';

const mockExecWaterfallStub = jest.fn();

const presetPromptHooks = (await import('../../../../lib/scaffold/actions/preset-prompt-hooks')).default;

describe('presetPromptHooks', () => {

  it('is decorated action', async () => {
    expect(presetPromptHooks).toHaveProperty('wrapped');
  });

  it('executes the presetPrompt hook with context & prompt', async () => {
    const mockGasket = {
      execWaterfall: mockExecWaterfallStub
    };
    const mockContext = {
      dest: '/some/path/my-app',
      presets: ['charcuterie-preset'],
      presetConfig: {
        plugins: ['the-wurst-plugin', 'loaf-me-alone']
      },
      errors: [],
      warnings: []
    };

    await presetPromptHooks(mockGasket, mockContext);
    expect(mockExecWaterfallStub).toHaveBeenCalledWith('presetPrompt', mockContext, { prompt: expect.any(Function) });
  });
});
