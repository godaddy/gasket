import { jest } from '@jest/globals';
import { makeGasket } from '@gasket/core';
import * as path from 'path';
import { setTimeout } from 'timers/promises';

const __dirname = new URL('.', import.meta.url).pathname;
const mockDir = path.join(__dirname, '__mocks__');

const mockPluginStatic = {
  default: {
    name: '@gasket/plugin-static',
    hooks: {
      init: jest.fn(),
      configure: jest.fn((g, c) => c),
      prepare: jest.fn((g, c) => c)
    }
  }
};
const mockPluginOne = {
  default: {
    name: '@gasket/plugin-one',
    hooks: {
      hook: () => {
      }
    }
  }
};
const mockPluginTwo = {
  default: {
    name: '@gasket/plugin-two',
    hooks: {
      hook: () => {
      }
    }
  }
};
const mockPluginCustom = {
  default: {
    name: 'plugin-custom',
    hooks: {
      configure: jest.fn((g, c) => c)
    }
  }
};

jest.unstable_mockModule('@gasket/plugin-one', () => mockPluginOne);
jest.unstable_mockModule('@gasket/plugin-two', () => mockPluginTwo);
jest.unstable_mockModule(path.join(mockDir, 'plugin-custom.js'), () => mockPluginCustom);

const pluginDynamicPlugins = (await import('../lib/index.js')).default;

describe('Prepare Hook', () => {
  let registerPluginsSpy, execApplySyncSpy, execApplySpy, traceSpy, generateGasket, mockConfig;
  let execApplySyncHandler;

  beforeEach(() => {
    generateGasket = function (gasketEnv) {
      // eslint-disable-next-line no-process-env
      process.env.GASKET_ENV = gasketEnv;
      const gasket = makeGasket({
        root: mockDir,
        plugins: [mockPluginStatic],
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
              '@gasket/plugin-two',
              null,
              undefined // eslint-disable-line no-undefined
            ]
          },
          'local.custom': {
            dynamicPlugins: [
              './plugin-custom.js'
            ]
          }
        }
      });
      mockConfig = gasket.config;
      registerPluginsSpy = jest.spyOn(gasket.engine, 'registerPlugins');
      execApplySyncHandler = jest.fn();
      execApplySyncSpy = jest.spyOn(gasket, 'execApplySync').mockImplementation(execApplySyncHandler);
      execApplySpy = jest.spyOn(gasket, 'execApply');
      traceSpy = gasket.trace = jest.fn().mockImplementation(() => {
      });
      return gasket;
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not add plugins if dynamicPlugins is not configured', async () => {
    const gasket = generateGasket('local.nothing');
    await pluginDynamicPlugins.hooks.prepare.handler(gasket, mockConfig);

    expect(registerPluginsSpy).not.toHaveBeenCalled();
    expect(execApplySyncSpy).not.toHaveBeenCalled();
  });

  it('registers multiple dynamic plugins and calls hooks if configured', async () => {
    const gasket = generateGasket('local.both');
    await pluginDynamicPlugins.hooks.prepare.handler(gasket, mockConfig);

    expect(gasket.engine.registerPlugins).toHaveBeenCalledWith(
      expect.arrayContaining([mockPluginOne.default, mockPluginTwo.default])
    );
    expect(gasket.config.plugins).toContain(mockPluginOne.default);
    expect(gasket.config.plugins).toContain(mockPluginTwo.default);
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(1, 'init', expect.any(Function));
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(2, 'configure', expect.any(Function));
    expect(execApplySpy).toHaveBeenNthCalledWith(1, 'prepare', expect.any(Function));
  });

  it('registers dynamic plugins ignoring falsy', async () => {
    const gasket = generateGasket('local.two');
    await pluginDynamicPlugins.hooks.prepare.handler(gasket, mockConfig);
    expect(gasket.engine.registerPlugins).toHaveBeenCalledWith(expect.arrayContaining([mockPluginTwo.default]));
    expect(gasket.config.plugins).toContain(mockPluginTwo.default);
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(1, 'init', expect.any(Function));
    expect(execApplySyncSpy).toHaveBeenNthCalledWith(2, 'configure', expect.any(Function));
    expect(execApplySpy).toHaveBeenNthCalledWith(1, 'prepare', expect.any(Function));
  });

  it('ignores setup lifecycles for non-dynamic plugins', async () => {
    expect(mockPluginStatic.default.hooks.init).not.toHaveBeenCalled();
    expect(mockPluginStatic.default.hooks.configure).not.toHaveBeenCalled();
    expect(mockPluginStatic.default.hooks.prepare).not.toHaveBeenCalled();

    const gasket = generateGasket('local.both');
    await setTimeout(100);

    expect(mockPluginStatic.default.hooks.init).toHaveBeenCalledTimes(1);
    expect(mockPluginStatic.default.hooks.configure).toHaveBeenCalledTimes(1);
    expect(mockPluginStatic.default.hooks.prepare).toHaveBeenCalledTimes(1);

    await pluginDynamicPlugins.hooks.prepare.handler(gasket, mockConfig);

    expect(traceSpy).toHaveBeenCalledWith(expect.stringContaining('deduped'));
    expect(traceSpy).toHaveBeenCalledTimes(1);
  });

  it('loads local app plugins from relative path', async () => {
    const gasket = generateGasket('local.custom');
    await pluginDynamicPlugins.hooks.prepare.handler(gasket, mockConfig);

    expect(gasket.engine.registerPlugins).toHaveBeenCalledWith(expect.arrayContaining([mockPluginCustom.default]));
  });
});
