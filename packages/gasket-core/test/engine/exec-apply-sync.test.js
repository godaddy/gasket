import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine, GasketEngineDriver }  = await import('../../lib/engine.js');

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

  function mockApplyHandler(plugin, handler) {
    return handler(new Wrapper(plugin));
  }

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    engine = new GasketEngine([pluginA, pluginB, pluginC]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes hooks with driver', () => {
    engine.execApplySync('eventA', mockApplyHandler);

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver), expect.any(Wrapper));
    expect(hookBSpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver), expect.any(Wrapper));
    expect(hookCSpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver), expect.any(Wrapper));
  });

  it('driver passed through', () => {
    const spy = jest.spyOn(engine._nucleus, 'execApplySync');
    const driver = engine.withDriver();

    driver.execApplySync('eventA', mockApplyHandler);

    expect(spy).toHaveBeenCalledWith(driver, 'eventA', mockApplyHandler);
  });

  it('returns an Array of results', () => {
    const result = engine.execApplySync('eventA', mockApplyHandler);

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', () => {
    const result = engine.execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = engine.execApplySync('eventB', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', () => {
    const { execApplySync } = engine;

    const result = execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toEqual(pluginA);
    expect(result[1].plugin).toEqual(pluginB);
    expect(result[2].plugin).toEqual(pluginC);
  });

  it('can be executed with differing callbacks', () => {
    const stub1 = jest.fn().mockImplementation((plugin, handler) => handler());
    const stub2 = jest.fn().mockImplementation((plugin, handler) => handler());

    engine.execApplySync('eventA', stub1);
    engine.execApplySync('eventA', stub2);

    expect(stub1).toHaveBeenCalledTimes(3);
    expect(stub2).toHaveBeenCalledTimes(3);
  });

  it('has expected trace output', () => {
    engine.execApplySync('eventA', mockApplyHandler);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◆ execApplySync(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginB:eventA'],
      ['[0]  ↪ pluginC:eventA']
    ]);
  });
});
