/* eslint-disable max-nested-callbacks, max-len */

const builderConstructorStub = jest.fn();
const addAppStub = jest.fn();
const addPluginStub = jest.fn();
const addPluginsStub = jest.fn();
const addPresetStub = jest.fn();
const addPresetsStub = jest.fn();
const addModuleStub = jest.fn();
const addModulesStub = jest.fn();
const getConfigSetStub = jest.fn();
const mockLogger = {
  info: jest.fn(),
  error: jest.fn()
};

class MockBuilder {
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
  addPreset() {
    addPresetStub(...arguments);
  }
  addPresets() {
    addPresetsStub(...arguments);
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
}

const mockDefaults = { link: 'FAKE.md#bogus' };
MockBuilder.docsSetupDefault = mockDefaults;

const buildConfigSet = require('../../lib/utils/build-config-set');
jest.mock('../../lib/utils/config-set-builder', () => MockBuilder);

const { findPluginData } = buildConfigSet;

const makeGasket = () => ({
  execApply: jest.fn(),
  logger: mockLogger,
  config: {
    root: '/path/to/app',
    docs: {
      outputDir: '.docs'
    }
  },
  metadata: {
    app: {
      name: 'my-app'
    },
    plugins: [{
      name: 'example-plugin',
      module: {
        name: 'example-plugin',
        hooks: {
          one: f => f
        }
      }
    }, {
      name: '@some/unnamed-plugin',
      module: {
        // nameless plugin
        hooks: {
          one: f => f,
          two: f => f
        }
      }
    }, {
      name: '@another/unnamed-plugin',
      module: {
        // nameless plugin
        hooks: {
          one: f => f,
          two: f => f
        }
      }
    }, {
      name: '/path/to/app/plugins/app-plugin',
      module: {
        name: 'app-plugin',
        hooks: {
          one: f => f,
          two: f => f,
          three: f => f
        }
      }
    }],
    presets: [{
      name: 'example-preset'
    }],
    modules: [{
      name: 'example-module'
    }]
  }
});

describe('utils - buildConfigSet', () => {
  let mockGasket;
  let docsSetupCallback, mockHandler, mockDocsSetup;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockGasket = makeGasket();

    await buildConfigSet(mockGasket);

    docsSetupCallback = mockGasket.execApply.mock.calls[0][1];

    mockDocsSetup = {
      link: 'README.md#with-hash'
    };

    mockHandler = jest.fn().mockResolvedValue(mockDocsSetup);
  });

  it('instantiates a builder', async () => {
    await buildConfigSet(mockGasket);
    expect(builderConstructorStub).toHaveBeenCalledWith(mockGasket);
  });

  it('adds app', async () => {
    expect(addAppStub).toHaveBeenCalledWith(mockGasket.metadata.app);
  });

  it('adds plugins from metadata', async () => {
    expect(addPluginsStub).toHaveBeenCalledWith(mockGasket.metadata.plugins);
  });

  it('adds presets from metadata', async () => {
    expect(addPresetsStub).toHaveBeenCalledWith(mockGasket.metadata.presets);
  });

  it('adds modules from metadata', async () => {
    expect(addModulesStub).toHaveBeenCalledWith(mockGasket.metadata.modules);
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
      expect(addAppStub).toHaveBeenCalledWith(mockGasket.metadata.app, mockDocsSetup);
    });

    it('does not add app if no null plugin (from ./lifecycles file)', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      expect(addAppStub).not.toHaveBeenCalledWith(mockGasket.metadata.app, mockDocsSetup);
    });

    it('adds plugin with associated metadata (by name)', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      expect(addPluginStub).toHaveBeenCalledWith(mockGasket.metadata.plugins[0], mockDocsSetup);
    });

    it('adds plugin with associated metadata (by hooks)', async () => {
      await docsSetupCallback({ hooks: { one: f => f } }, mockHandler);
      expect(addPluginStub).toHaveBeenCalledWith(mockGasket.metadata.plugins[0], mockDocsSetup);
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
      mockPluginDatas = mockGasket.metadata.plugins;
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
