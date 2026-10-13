
const { GasketEngine } = await import('../../lib/engine.js');

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
    const spy = vi.spyOn(GasketEngine.prototype, 'registerPlugins');
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

  it('accepts plugins with only actions', () => {
    const actionOnlyPlugin = {
      name: '@gasket/plugin-action-only',
      actions: {
        doThing: () => 'done'
      }
    };

    const engine = new GasketEngine([actionOnlyPlugin]);
    expect(engine._pluginMap).toHaveProperty('@gasket/plugin-action-only', actionOnlyPlugin);
    expect(engine.actions.doThing()).toEqual('done');
  });

  it('throws when a plugin has neither hooks nor actions', () => {
    expect(() => new GasketEngine([{ name: 'faulty' }]))
      .toThrow('Plugin (faulty) must have hooks or actions');
  });
});
