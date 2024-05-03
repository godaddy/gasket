import GasketEngine from '../../lib/engine';

describe('The execApplySync method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

  const Wrapper = class Wrapper {
    constructor(plugin) {
      this.plugin = plugin;
    }
  };

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA(eng, arg, lit) {
        return { arg, lit };
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA(eng, arg) {
        return arg;
      }
    }
  };

  const pluginC = {
    name: 'pluginC',
    hooks: {
      eventA: {
        timing: { after: ['pluginA'] },
        handler: (eng, arg) => arg
      }
    }
  };

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    engine = new GasketEngine([pluginA, pluginB, pluginC]);
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('passes the gasket config to each hook', async () => {
    await engine.execApply('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(hookASpy).toHaveBeenCalledWith(engine, expect.any(Wrapper));
    expect(hookBSpy).toHaveBeenCalledWith(engine, expect.any(Wrapper));
    expect(hookCSpy).toHaveBeenCalledWith(engine, expect.any(Wrapper));
  });

  it('returns an Array of results', async () => {
    const result = engine.execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', async () => {
    const result = engine.execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = engine.execApplySync('eventB', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { execApplySync } = engine;

    const result = execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('can be executed with differing callbacks', async () => {
    const stub1 = jest.fn().mockImplementation((plugin, handler) => handler());
    const stub2 = jest.fn().mockImplementation((plugin, handler) => handler());

    engine.execApplySync('eventA', stub1);
    engine.execApplySync('eventA', stub2);

    expect(stub1).toHaveBeenCalledTimes(3);
    expect(stub2).toHaveBeenCalledTimes(3);
  });
});
