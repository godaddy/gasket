import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketProxy }  = await import('../../lib/proxy.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execApplySync method', () => {
  let gasket, hookASpy, hookBSpy, hookCSpy;

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

  /**
   *
   * @param plugin
   * @param handler
   */
  function mockApplyHandler(plugin, handler) {
    return handler(new Wrapper(plugin));
  }

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    gasket = new Gasket({ plugins: [pluginA, pluginB, pluginC] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes hooks with driver', () => {
    gasket.execApplySync('eventA', mockApplyHandler);

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketProxy), expect.any(Wrapper));
    expect(hookBSpy).toHaveBeenCalledWith(expect.any(GasketProxy), expect.any(Wrapper));
    expect(hookCSpy).toHaveBeenCalledWith(expect.any(GasketProxy), expect.any(Wrapper));
  });

  it('driver passed through', () => {
    const spy = jest.spyOn(gasket.engine, 'execApplySync');
    const proxy = gasket.asProxy();

    proxy.execApplySync('eventA', mockApplyHandler);

    expect(spy).toHaveBeenCalledWith(proxy, 'eventA', mockApplyHandler);
  });

  it('returns an Array of results', () => {
    const result = gasket.execApplySync('eventA', mockApplyHandler);

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', () => {
    const result = gasket.execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = gasket.execApplySync('eventB', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', () => {
    const { execApplySync } = gasket;

    const result = execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('can be executed with differing callbacks', () => {
    const stub1 = jest.fn().mockImplementation((plugin, handler) => handler());
    const stub2 = jest.fn().mockImplementation((plugin, handler) => handler());

    gasket.execApplySync('eventA', stub1);
    gasket.execApplySync('eventA', stub2);

    expect(stub1).toHaveBeenCalledTimes(3);
    expect(stub2).toHaveBeenCalledTimes(3);
  });

  it('has expected trace output', () => {
    mockDebug.mockClear();
    gasket.execApplySync('eventA', mockApplyHandler);

    expect(mockDebug.mock.calls).toEqual([
      ['[2]  ◆ execApplySync(eventA)'],
      ['[2]  ↪ pluginA:eventA'],
      ['[2]  ↪ pluginB:eventA'],
      ['[2]  ↪ pluginC:eventA']
    ]);
  });
});
