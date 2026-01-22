import { vi } from 'vitest';

const builderConstructorStub = vi.fn();
const addAppStub = vi.fn();
const addPluginStub = vi.fn();
const addPluginsStub = vi.fn();
const addModuleStub = vi.fn();
const addModulesStub = vi.fn();
const getConfigSetStub = vi.fn();
const mockLogger = {
  info: vi.fn(),
  error: vi.fn()
};


import buildConfigSet from '../../lib/utils/build-config-set.js';
const { mockDefaults } = vi.hoisted(() => {
  const mockDefaults = { link: 'FAKE.md#bogus' };
  return { mockDefaults };
});

vi.mock('../../lib/utils/config-set-builder', () => {
  const MockBuilder = class {
    constructor() {
      builderConstructorStub(...arguments);
    }

    addApp() {
      addAppStub(...arguments);
    }
    addPlugin() {
      addPluginStub(...arguments);
    }
    addPlugins() {
      addPluginsStub(...arguments);
    }
    addModule() {
      addModuleStub(...arguments);
    }
    addModules() {
      addModulesStub(...arguments);
    }
    getConfigSet() {
      return getConfigSetStub(...arguments);
    }
  };

  MockBuilder.docsSetupDefault = mockDefaults;

  return { default: MockBuilder };
});

const { findPluginData } = buildConfigSet;

const makeGasket = () => ({
  execApply: vi.fn(),
  logger: mockLogger,
  config: {
    root: '/path/to/app',
    docs: {
      outputDir: '.docs'
    }
  },
  actions: {
    getMetadata: vi.fn(() => ({
      app: {
        name: 'my-app'
      },
      plugins: [
        {
          name: 'example-plugin',
          hooks: {
            one: f => f
          }
        },
        {
          name: '@some/unnamed-plugin',
          hooks: {
            one: f => f,
            two: f => f
          }
        },
        {
          name: '@another/unnamed-plugin',
          hooks: {
            one: f => f,
            two: f => f
          }

        },
        {

          name: 'app-plugin',
          hooks: {
            one: f => f,
            two: f => f,
            three: f => f
          }
        }
      ],
      presets: [
        {
          name: 'example-preset'
        }
      ],
      modules: [
        {
          name: 'example-module'
        }
      ]
    }))
  }
});

describe('utils - buildConfigSet', () => {
  let mockGasket, metadata;
  let docsSetupCallback, mockHandler, mockDocsSetup;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockGasket = makeGasket();
    metadata = await mockGasket.actions.getMetadata(mockGasket);

    await buildConfigSet(mockGasket);

    docsSetupCallback = mockGasket.execApply.mock.calls[0][1];

    mockDocsSetup = {
      link: 'README.md#with-hash'
    };

    mockHandler = vi.fn().mockResolvedValue(mockDocsSetup);
  });

  it('instantiates a builder', async () => {
    await buildConfigSet(mockGasket);
    expect(builderConstructorStub).toHaveBeenCalledWith(mockGasket);
  });

  it('adds app', async () => {
    expect(addAppStub).toHaveBeenCalledWith(metadata.app);
  });

  it('adds plugins from metadata', async () => {
    expect(JSON.stringify(addPluginsStub.mock.calls[0][0])).toEqual(JSON.stringify(metadata.plugins));
  });

  it('adds modules from metadata', async () => {
    expect(addModulesStub).toHaveBeenCalledWith(metadata.modules);
  });

  it('returns docsConfigSet from builder', async () => {
    const results = await buildConfigSet(mockGasket);
    expect(results).toEqual(getConfigSetStub.mock.calls[0].results);
  });

  describe('docsSetup lifecycle', () => {
    it('lifecycle is executed', async () => {
      await buildConfigSet(mockGasket);
      expect(mockGasket.execApply).toHaveBeenCalledWith('docsSetup', expect.any(Function));
    });

    it('docsSetup defaults are available to app-level hooks', async () => {
      await docsSetupCallback(null, mockHandler);
      expect(mockHandler).toHaveBeenCalledWith(expect.any(Object));
      expect(mockHandler.mock.calls[0][0]).toHaveProperty('defaults', mockDefaults);
    });

    it('docsSetup defaults are available to plugin-level hooks', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      expect(mockHandler).toHaveBeenCalledWith(expect.any(Object));
      expect(mockHandler.mock.calls[0][0]).toHaveProperty('defaults', mockDefaults);
    });

    it('adds app if if plugin is null (from ./lifecycles file)', async () => {
      await docsSetupCallback(null, mockHandler);
      expect(addAppStub).toHaveBeenCalledWith(metadata.app, mockDocsSetup);
    });

    it('does not add app if no null plugin (from ./lifecycles file)', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      expect(addAppStub).not.toHaveBeenCalledWith(metadata.app, mockDocsSetup);
    });

    it('adds plugin with associated metadata (by name)', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      expect(JSON.stringify(addPluginStub.mock.calls[0][0]))
        .toEqual(JSON.stringify(metadata.plugins[0]));
      expect(addPluginStub.mock.calls[0][1]).toEqual(mockDocsSetup);
    });

    it('adds plugin with associated metadata (by hooks)', async () => {
      await docsSetupCallback({ hooks: { one: f => f } }, mockHandler);
      expect(JSON.stringify(addPluginStub.mock.calls[0][0]))
        .toEqual(JSON.stringify(metadata.plugins[0]));
      expect(addPluginStub.mock.calls[0][1]).toEqual(mockDocsSetup);
    });

    it('does not add plugin if null', async () => {
      await docsSetupCallback(null, mockHandler);
      expect(addPluginStub).not.toHaveBeenCalledWith(expect.any(Object), mockDocsSetup);
    });

    it('does not add plugin if no metadata found', async () => {
      await docsSetupCallback({ name: 'missing-plugin' }, mockHandler);
      expect(addPluginStub).not.toHaveBeenCalledWith(expect.any(Object), mockDocsSetup);
    });
  });

  describe('findPluginData', () => {
    let mockPluginDatas;

    beforeEach(() => {
      mockPluginDatas = metadata.plugins;
    });

    it('returns found pluginData from plugin name', () => {
      const result = findPluginData({ name: 'example-plugin' }, mockPluginDatas, mockLogger);
      expect(result).toEqual(mockPluginDatas[0]);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('logs error if no pluginData found', () => {
      const result = findPluginData({ name: 'missing-plugin' }, mockPluginDatas, mockLogger);
      expect(result).toBeFalsy();
      expect(mockLogger.error.mock.calls[0][0]).toContain('Unable to find pluginData');
    });

    describe('when plugin missing name', () => {

      it('returns found pluginData from plugin hooks', () => {
        const result = findPluginData({ hooks: { one: f => f } }, mockPluginDatas, mockLogger);
        expect(result).toEqual(mockPluginDatas[0]);
        expect(mockLogger.error).not.toHaveBeenCalled();
      });

      it('no return value if no pluginData found', () => {
        const result = findPluginData({ hooks: { missing: f => f } }, mockPluginDatas, mockLogger);
        expect(result).toBeFalsy();
      });

      it('logs info for found plugin', () => {
        const result = findPluginData({ hooks: { one: f => f } }, mockPluginDatas, mockLogger);
        expect(result).toEqual(mockPluginDatas[0]);
        expect(mockLogger.info.mock.calls[0][0]).toContain('Determined plugin with missing name');
      });

      it('logs error if multiple plugins with matching hooks', () => {
        const result = findPluginData({ hooks: { one: f => f, two: f => f } }, mockPluginDatas, mockLogger);
        expect(result).toBeFalsy();
        expect(mockLogger.error.mock.calls[0][0]).toContain('More than one pluginData');
      });

      it('logs error if no match found', () => {
        const result = findPluginData({ hooks: { missing: f => f } }, mockPluginDatas, mockLogger);
        expect(result).toBeFalsy();
        expect(mockLogger.error.mock.calls[0][0]).toContain('Unable to find pluginData');
      });
    });
  });
});
