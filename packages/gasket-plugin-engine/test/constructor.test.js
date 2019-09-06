const { Loader } = require('@gasket/resolve');
const PluginEngine = require('..');

jest.mock('@gasket/resolve');

describe('constructor', () => {

  const mockConfig = {
    some: 'config'
  };

  beforeEach(() => {
    jest.spyOn(Loader.prototype, 'loadConfigured').mockImplementation(() => ({
      plugins: []
    }));
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
    // eslint-disable-next-line no-unused-vars
    const engine = new PluginEngine(mockConfig, { resolveFrom: '/some/path' });
    expect(Loader).toHaveBeenCalledWith({ resolveFrom: '/some/path' });
  });

  it('exposed expected methods', () => {
    const engine = new PluginEngine();
    ['exec', 'execWaterfall', 'execMap', 'execApply',
      'execSync', 'execWaterfallSync', 'execMapSync', 'execApplySync'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });
});
