import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketProxy }  = await import('../../lib/proxy.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execApply method', () => {
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
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    gasket = new Gasket({ plugins: [pluginA, pluginB, pluginC] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes hooks with driver', async () => {
    await gasket.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketProxy), expect.any(Wrapper));
    expect(hookBSpy).toHaveBeenCalledWith(expect.any(GasketProxy), expect.any(Wrapper));
    expect(hookCSpy).toHaveBeenCalledWith(expect.any(GasketProxy), expect.any(Wrapper));
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(gasket.engine, 'execApply');
    const proxy = gasket.asProxy();

    /**
     *
     * @param plugin
     * @param handler
     */
    async function applyHandler(plugin, handler) {
      return handler(new Wrapper(plugin));
    }

    await proxy.execApply('eventA', applyHandler);

    expect(spy).toHaveBeenCalledWith(proxy, 'eventA', applyHandler);
  });

  it('awaits sync or async hooks and resolves an Array', async () => {
    const result = await gasket.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', async () => {
    const result = await gasket.execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = await gasket.execApply('eventB', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { execApply } = gasket;

    const result = await execApply('eventA', async (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('can be executed with differing callbacks', async () => {
    const stub1 = jest.fn().mockImplementation((plugin, handler) => handler());
    const stub2 = jest.fn().mockImplementation((plugin, handler) => handler());

    await gasket.execApply('eventA', stub1);
    await gasket.execApply('eventA', stub2);

    expect(stub1).toHaveBeenCalledTimes(3);
    expect(stub2).toHaveBeenCalledTimes(3);
  });

  it('has expected trace output', async () => {
    mockDebug.mockClear();

    /**
     *
     * @param plugin
     * @param handler
     */
    async function applyHandler(plugin, handler) {
      return handler(new Wrapper(plugin));
    }

    await gasket.execApply('eventA', applyHandler);

    expect(mockDebug.mock.calls).toEqual([
      ['[2]  ◇ execApply(eventA)'],
      ['[2]  ↪ pluginA:eventA'],
      ['[2]  ↪ pluginB:eventA'],
      ['[2]  ↪ pluginC:eventA']
    ]);
  });
});
