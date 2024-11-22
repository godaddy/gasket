const { GasketEngine }  = await import('../../lib/engine.js');

const mockPlugin = {
  name: '@gasket/plugin-one',
  hooks: {}
};

describe('constructor', () => {

  it('requires plugins', () => {
    expect(() => new GasketEngine()).toThrow(/plugins/);
  });

  it('requires plugins to be an array', () => {
    expect(() => new GasketEngine([])).toThrow(/plugins/);
  });

  it('calls registerPlugins in the constructor', () => {
    const spy = jest.spyOn(GasketEngine.prototype, 'registerPlugins');
    // eslint-disable-next-line no-new
    new GasketEngine([mockPlugin]);
    expect(spy).toHaveBeenCalledWith([mockPlugin]);
  });

  it('exposed expected lifecycle methods', () => {
    const engine = new GasketEngine([mockPlugin]);
    ['exec', 'execWaterfall', 'execMap', 'execApply',
      'execSync', 'execWaterfallSync', 'execMapSync', 'execApplySync'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });

  it('exposed expected additional methods', () => {
    const engine = new GasketEngine([mockPlugin]);
    ['hook'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });

  it('maps plugin name to content', () => {
    const engine = new GasketEngine([mockPlugin]);
    expect(engine._pluginMap).toHaveProperty('@gasket/plugin-one', mockPlugin);
  });
});
