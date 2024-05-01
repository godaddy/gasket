import { jest } from '@jest/globals';

const mockExecWaterfallStub = jest.fn();
const presetConfigHooks = (await import('../../../../lib/scaffold/actions/preset-config-hooks')).default;

describe('presetConfigHooks', () => {

  it('is decorated action', async () => {
    expect(presetConfigHooks).toHaveProperty('wrapped');
  });

  it('executes the presetConfig hook for plugins with context', async () => {
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

    await presetConfigHooks(mockGasket, mockContext);
    expect(mockExecWaterfallStub).toHaveBeenCalledWith('presetConfig', mockContext);
  });
});
