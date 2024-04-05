const PluginEngine = require('..');

const mockPlugin = {
  name: '@gasket/plugin-one',
  hooks: {}
};

describe('constructor', () => {
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      plugins: [mockPlugin]
    };
  });

  it('requires plugins', () => {
    expect(() => new PluginEngine()).toThrow(/plugins/);
  });

  it('requires plugins to be an array', () => {
    expect(() => new PluginEngine({ plugins: [] })).toThrow(/plugins/);
  });

  it('exposed expected methods', () => {
    const engine = new PluginEngine(mockConfig);
    ['exec', 'execWaterfall', 'execMap', 'execApply',
      'execSync', 'execWaterfallSync', 'execMapSync', 'execApplySync'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });

  it('maps plugin name to content', () => {
    const engine = new PluginEngine(mockConfig);
    expect(engine._pluginMap).toHaveProperty('@gasket/plugin-one', mockPlugin);
  });
});
