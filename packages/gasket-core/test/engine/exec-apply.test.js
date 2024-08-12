import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine, GasketEngineDriver }  = await import('../../lib/engine.js');


describe('The execApply method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy, mockApply;

  const Wrapper = class Wrapper {
    constructor(plugin) {
      this.plugin = plugin;
    }
  };

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA(eng, arg, lit) {
        return Promise.resolve({ arg, lit });
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
    mockApply = async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    };
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    engine = new GasketEngine([pluginA, pluginB, pluginC]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes hooks with driver', async () => {
    await engine.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver), expect.any(Wrapper));
    expect(hookBSpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver), expect.any(Wrapper));
    expect(hookCSpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver), expect.any(Wrapper));
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(engine._nucleus, 'execApply');
    const driver = engine.withDriver();

    async function applyHandler(plugin, handler) {
      return handler(new Wrapper(plugin));
    }

    await driver.execApply('eventA', applyHandler);

    expect(spy).toHaveBeenCalledWith(driver, 'eventA', applyHandler);
  });

  it('awaits sync or async hooks and resolves an Array', async () => {
    const result = await engine.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', async () => {
    const result = await engine.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = await engine.execApply('eventB', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { execApply } = engine;

    const result = await execApply('eventA', async (plugin, handler) => {
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

    await engine.execApply('eventA', stub1);
    await engine.execApply('eventA', stub2);

    expect(stub1).toHaveBeenCalledTimes(3);
    expect(stub2).toHaveBeenCalledTimes(3);
  });

  it('has expected trace output', async () => {
    async function applyHandler(plugin, handler) {
      return handler(new Wrapper(plugin));
    }

    await engine.execApply('eventA', applyHandler);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◇ execApply(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginB:eventA'],
      ['[0]  ↪ pluginC:eventA']
    ]);
  });
});
