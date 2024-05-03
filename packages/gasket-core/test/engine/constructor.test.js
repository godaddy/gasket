import GasketEngine from '../../lib/engine';

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

  it('exposed expected methods', () => {
    const engine = new GasketEngine([mockPlugin]);
    ['exec', 'execWaterfall', 'execMap', 'execApply',
      'execSync', 'execWaterfallSync', 'execMapSync', 'execApplySync'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });

  it('maps plugin name to content', () => {
    const engine = new GasketEngine([mockPlugin]);
    expect(engine._pluginMap).toHaveProperty('@gasket/plugin-one', mockPlugin);
  });
});
