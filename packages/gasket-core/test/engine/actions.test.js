import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketProxy }  = await import('../../lib/proxy.js');
const { Gasket }  = await import('../../lib/gasket.js');

const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
});

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('actions', () => {
  let gasket, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      actions: {
        getActionsCount: jest.fn((gasket) => {
          return Object.keys(gasket.actions).length;
        }),
        getEventA: jest.fn(async (gasket, value) => {
          // for consistent debug ordering for tests
          await pause(value);
          return gasket.execWaterfall('eventA', value);
        }),
        getEventB: jest.fn(async (gasket, value) => {
          // for consistent debug ordering for tests
          await pause(value);
          return gasket.execWaterfall('eventB', value);
        }),
        getEvents: jest.fn(async (gasket, value) => {
          const a = await gasket.actions.getEventA(value);
          const b = await gasket.actions.getEventB(value);
          return { a, b };
        })
      },
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 100;
        }),
        eventB: jest.fn((gasket, value) => {
          return value + 1000;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 4;
        })
      }
    };

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
    mockDebug.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('actions are registered', async () => {
    expect(gasket.actions).toBeDefined();
    expect(gasket.actions.getActionsCount).toEqual(expect.any(Function));
    expect(gasket.actions.getEventA).toEqual(expect.any(Function));
  });

  it('sequentially transforms a value',  () => {
    const result = gasket.actions.getActionsCount();
    expect(result).toEqual(4);
  });

  it('works when invoked without a context', () => {
    const { getActionsCount } = gasket.actions;
    const result = getActionsCount();
    expect(result).toEqual(4);
  });

  it('invokes hooks with driver', async () => {
    const result = await gasket.actions.getEventA(5);
    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketProxy), 5);
    expect(result).toEqual(109);
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(gasket.engine, 'execWaterfall');
    const proxy = gasket.asProxy();

    const result = await proxy.actions.getEventA(5);
    expect(spy).toHaveBeenCalledWith(proxy, 'eventA', 5);
    expect(result).toEqual(109);
  });

  it('has expected trace output', async () => {
    await gasket.actions.getEventA(5);

    expect(mockDebug.mock.calls).toEqual([
      ['[2]  ⚡︎ getEventA'],
      ['[2]    ◇ execWaterfall(eventA)'],
      ['[2]    ↪ pluginA:eventA'],
      ['[2]    ↪ pluginB:eventA']
    ]);
  });

  it('allows multiple lifecycle chains', async () => {
    const spy = jest.spyOn(gasket.engine, 'execWaterfall');
    const promise1 = gasket.actions.getEventA(1);
    const promise2 = gasket.actions.getEventA(2);

    const [results1, results2] = await Promise.all([promise1, promise2]);

    expect(results1).toEqual(105);
    expect(results2).toEqual(106);
    expect(spy).toHaveBeenCalledTimes(2);

    expect(mockDebug.mock.calls).toEqual([
      ['[2]  ⚡︎ getEventA'],
      ['[3]  ⚡︎ getEventA'],
      ['[2]    ◇ execWaterfall(eventA)'],
      ['[2]    ↪ pluginA:eventA'],
      ['[2]    ↪ pluginB:eventA'],
      ['[3]    ◇ execWaterfall(eventA)'],
      ['[3]    ↪ pluginA:eventA'],
      ['[3]    ↪ pluginB:eventA']
    ]);
  });

  it('actions can call other actions', async () => {
    const results = await gasket.actions.getEvents(5);

    expect(results).toEqual({ a: 109, b: 1005 });
    expect(pluginA.actions.getEventA).toHaveBeenCalled();
    expect(pluginA.actions.getEventB).toHaveBeenCalled();
  });

  it('warns on duplicate action names', () => {
    pluginB.actions = {
      getActionsCount: jest.fn().mockReturnValue('override?')
    };
    gasket = new Gasket({ plugins: [pluginA, pluginB] });

    expect(errorSpy).toHaveBeenCalledWith(
      'Action \'getActionsCount\' from \'pluginB\' was registered by \'pluginA\''
    );

    const { getActionsCount } = gasket.actions;
    expect(getActionsCount()).toEqual(4);

    expect(pluginA.actions.getActionsCount).toHaveBeenCalled();
    expect(pluginB.actions.getActionsCount).not.toHaveBeenCalled();
  });

});
