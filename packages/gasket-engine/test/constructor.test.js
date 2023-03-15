const { Loader } = require('@gasket/resolve');
const PluginEngine = require('..');

describe('constructor', () => {
  let loadConfiguredSpy;

  const mockConfig = {
    some: 'config'
  };

  beforeEach(() => {
    loadConfiguredSpy = jest.spyOn(Loader.prototype, 'loadConfigured');
    loadConfiguredSpy.mockImplementation(() => ({
      plugins: []
    }));
  });

  afterEach(() => {
    loadConfiguredSpy.mockRestore();
  });

  it('defaults empty config object', () => {
    const engine = new PluginEngine();
    expect(engine.config).toEqual({});
  });

  it('exposes config object', () => {
    const engine = new PluginEngine(mockConfig);
    expect(engine.config).toBe(mockConfig);
  });

  it('exposes loader instance', () => {
    const engine = new PluginEngine(mockConfig);
    expect(engine.loader).toBeInstanceOf(Loader);
  });

  it('passes resolveFrom option to Loader', () => {
    const engine = new PluginEngine(mockConfig, { resolveFrom: '/some/path' });
    expect(engine.loader._resolveFrom).toEqual(['/some/path']);
  });

  it('exposed expected methods', () => {
    const engine = new PluginEngine();
    ['exec', 'execWaterfall', 'execMap', 'execApply',
      'execSync', 'execWaterfallSync', 'execMapSync', 'execApplySync'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });

  describe('_registerPlugins', () => {
    let mockPlugin;

    beforeEach(() => {
      mockPlugin = {
        name: '@gasket/plugin-one',
        module: {}
      };

      loadConfiguredSpy.mockImplementation(() => ({ plugins: [mockPlugin] }));
    });

    it('maps plugin name to content', () => {
      const engine = new PluginEngine(mockConfig);

      expect(engine._plugins).toHaveProperty('@gasket/plugin-one', mockPlugin.module);
    });

    it('prefers name from pluginInfo over module', () => {
      mockPlugin.module.name = 'bogus';

      const engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('@gasket/plugin-one', mockPlugin.module);
    });

    it('use name from module if not found in pluginInfo', () => {
      delete mockPlugin.name;
      mockPlugin.module.name = '@gasket/one';

      const engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('@gasket/plugin-one', mockPlugin.module);
    });

    it('normalizes names to be long form', () => {
      mockPlugin.name = 'one';
      let engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('gasket-plugin-one', mockPlugin.module);

      mockPlugin.name = '@gasket/one';
      engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('@gasket/plugin-one', mockPlugin.module);

      mockPlugin.name = '@user/one';
      engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('@user/gasket-plugin-one', mockPlugin.module);
    });

    it('plugins loaded from paths use normalized name from module', () => {
      mockPlugin.name = '/path/to/some-local-plugin';
      mockPlugin.module.name = 'some-local';
      const engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('gasket-plugin-some-local', mockPlugin.module);
    });

    it('plugins loaded from paths use normalized name from module (windows)', () => {
      mockPlugin.name = 'C:\\\\path\\to\\some-local-plugin';
      mockPlugin.module.name = 'some-local';
      const engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('gasket-plugin-some-local', mockPlugin.module);
    });

    it('plugins loaded from paths fallback to path if name not in module', () => {
      mockPlugin.name = '/path/to/some-local-plugin';
      const engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('/path/to/some-local-plugin', mockPlugin.module);
    });

    it('plugins loaded from paths fallback to path if name not in module (windows)', () => {
      mockPlugin.name = 'C:\\\\path\\to\\some-local-plugin';
      const engine = new PluginEngine(mockConfig);
      expect(engine._plugins).toHaveProperty('C:\\\\path\\to\\some-local-plugin', mockPlugin.module);
    });
  });
});
