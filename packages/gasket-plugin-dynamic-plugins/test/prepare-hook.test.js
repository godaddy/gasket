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
  let registerPluginsSpy, execApplySyncSpy, generateGasket, mockConfig;

  beforeEach(() => {
    mockConfig = {};
    generateGasket = function (gasketEnv) {
      process.env.GASKET_ENV = gasketEnv;
      const gasket = makeGasket({
        plugins: [pluginDynamicPlugins],
        environments: {
          'local.nothing': {},
          'local.both': {
            dynamicPlugins: [
              '@gasket/plugin-one',
              '@gasket/plugin-two'
            ]
          },
          'local.two': {
            dynamicPlugins: [
              '@gasket/plugin-two'
            ]
          }
        }
      });
      registerPluginsSpy = jest.spyOn(gasket.engine, 'registerPlugins');
      execApplySyncSpy = jest.spyOn(gasket, 'execApplySync');
      return gasket;
    };

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not register dynamic plugins if GASKET_ENV is not set', async () => {
    const gasket = generateGasket();
    await pluginDynamicPlugins.hooks.prepare(gasket, mockConfig);
    expect(registerPluginsSpy).not.toHaveBeenCalled();
    expect(execApplySyncSpy).not.toHaveBeenCalled();
  });

  it('does not add plugins if dynamicPlugins is not set on a GASKET_ENV', async () => {
    jest.clearAllMocks();
    const gasket = generateGasket('local.nothing');
    await pluginDynamicPlugins.hooks.prepare(gasket, mockConfig);
    expect(registerPluginsSpy).not.toHaveBeenCalled();
    expect(execApplySyncSpy).not.toHaveBeenCalled();
  });

  it('registers dynamic plugins and calls hooks for a specific GASKET_ENV', async () => {
    jest.clearAllMocks();
    const gasket = generateGasket('local.both');
    await pluginDynamicPlugins.hooks.prepare(gasket, mockConfig);
    expect(gasket.engine.registerPlugins).toHaveBeenCalledWith(expect.arrayContaining([mockPluginOne.default, mockPluginTwo.default]));
    expect(gasket.config.plugins).toContain(mockPluginOne.default);
    expect(gasket.config.plugins).toContain(mockPluginTwo.default);
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(1, 'init', expect.any(Function));
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(2, 'configure', expect.any(Function));
  });

  it('registers dynamic plugins and calls hooks for another GASKET_ENV', async () => {
    jest.clearAllMocks();
    const gasket = generateGasket('local.two');
    await pluginDynamicPlugins.hooks.prepare(gasket, mockConfig);
    expect(gasket.engine.registerPlugins).toHaveBeenCalledWith(expect.arrayContaining([mockPluginTwo.default]));
    expect(gasket.config.plugins).toContain(mockPluginTwo.default);
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(1, 'init', expect.any(Function));
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(2, 'configure', expect.any(Function));
  });
});
