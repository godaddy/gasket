import { jest } from '@jest/globals';
import { makeGasket } from '@gasket/core';

const mockPluginOne = { default: {
  name: '@gasket/plugin-one',
  hooks: {
    hook: () => {}
  }
} };
const mockPluginTwo = { default: {
  name: '@gasket/plugin-two',
  hooks: {
    hook: () => {}
  }
} };

jest.unstable_mockModule('@gasket/plugin-one', () => mockPluginOne);
jest.unstable_mockModule('@gasket/plugin-two', () => mockPluginTwo);

const pluginDynamicPlugins = (await import('../lib/index.js')).default;

describe('Prepare Hook', () => {
  let gasket, registerPluginsSpy, execApplySyncSpy;

  beforeEach(() => {
    gasket = makeGasket({
      plugins: [pluginDynamicPlugins],
      dynamicPlugins: ['@gasket/plugin-one', '@gasket/plugin-two']
    });
    registerPluginsSpy = jest.spyOn(gasket.engine, 'registerPlugins');
    execApplySyncSpy = jest.spyOn(gasket, 'execApplySync');
    process.env.GASKET_DYNAMIC = 1;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not register dynamic plugins if GASKET_DYNAMIC is not set', async () => {
    delete process.env.GASKET_DYNAMIC;
    await pluginDynamicPlugins.hooks.prepare(gasket);
    expect(registerPluginsSpy).not.toHaveBeenCalled();
    expect(execApplySyncSpy).not.toHaveBeenCalled();
  });

  it('does not add plugins if dynamicPlugins is not set', async () => {
    jest.clearAllMocks();
    delete gasket.config.dynamicPlugins;
    await pluginDynamicPlugins.hooks.prepare(gasket);
    expect(registerPluginsSpy).not.toHaveBeenCalled();
    expect(execApplySyncSpy).not.toHaveBeenCalled();
  });

  it('registers dynamic plugins and calls hooks', async () => {
    await pluginDynamicPlugins.hooks.prepare(gasket);
    expect(gasket.engine.registerPlugins).toHaveBeenCalledWith(expect.arrayContaining([mockPluginOne.default, mockPluginTwo.default]));
    expect(gasket.config.plugins).toContain(mockPluginOne.default);
    expect(gasket.config.plugins).toContain(mockPluginTwo.default);
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(1, 'init', expect.any(Function));
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(2, 'configure', expect.any(Function));
  });
});
