import { GasketEngine } from '../../lib/engine.js';

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

  it('exposed expected lifecycle methods', () => {
    const engine = new GasketEngine([mockPlugin]);
    ['exec', 'execWaterfall', 'execMap', 'execApply',
      'execSync', 'execWaterfallSync', 'execMapSync', 'execApplySync'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });

  it('exposed expected additional methods', () => {
    const engine = new GasketEngine([mockPlugin]);
    ['withDriver', 'hook'].forEach(name => {
      expect(engine).toHaveProperty(name, expect.any(Function));
    });
  });

  it('maps plugin name to content', () => {
    const engine = new GasketEngine([mockPlugin]);
    expect(engine._nucleus._pluginMap).toHaveProperty('@gasket/plugin-one', mockPlugin);
  });
});
