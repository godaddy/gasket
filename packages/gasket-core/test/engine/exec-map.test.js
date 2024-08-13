import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketProxy }  = await import('../../lib/proxy.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execMap method', () => {
  let gasket, hookASpy, hookBSpy, hookCSpy;

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA() {
        return Promise.resolve(1);
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA() {
        return 2;
      }
    }
  };

  const pluginC = {
    name: 'pluginC',
    hooks: {
      eventA: {
        timing: { after: ['pluginA'] },
        handler: () => 3
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
    await gasket.execMap('eventA');

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketProxy));
    expect(hookBSpy).toHaveBeenCalledWith(expect.any(GasketProxy));
    expect(hookCSpy).toHaveBeenCalledWith(expect.any(GasketProxy));
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(gasket.engine, 'execMap');
    const proxy = gasket.asProxy();

    const result = await proxy.execMap('eventA');
    expect(spy).toHaveBeenCalledWith(proxy, 'eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });

  it('awaits sync or async hooks and resolves a map object', async () => {
    const result = await gasket.execMap('eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });

  it('resolves to an empty object if nothing hooked the event', async () => {
    const result = await gasket.execMap('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', async () => {
    const { execMap } = gasket;

    const result = await execMap('eventA');

    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });

  it('has expected trace output', async () => {
    mockDebug.mockClear();
    await gasket.execMap('eventA');

    expect(mockDebug.mock.calls).toEqual([
      ['[2]  ◇ execMap(eventA)'],
      ['[2]  ↪ pluginA:eventA'],
      ['[2]  ↪ pluginB:eventA'],
      ['[2]  ↪ pluginC:eventA']
    ]);
  });
});
