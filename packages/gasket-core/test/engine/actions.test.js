import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine, GasketEngineDriver } = await import('../../lib/engine.js');

const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
});

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('actions', () => {
  let engine, pluginA, pluginB;

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

    engine = new GasketEngine([pluginA, pluginB]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('actions are registered', async () => {
    expect(engine.actions).toBeDefined();
    expect(engine.actions.getActionsCount).toEqual(expect.any(Function));
    expect(engine.actions.getEventA).toEqual(expect.any(Function));
  });

  it('sequentially transforms a value',  () => {
    const result = engine.actions.getActionsCount();
    expect(result).toEqual(4);
  });

  it('works when invoked without a context', () => {
    const { getActionsCount } = engine.actions;
    const result = getActionsCount();
    expect(result).toEqual(4);
  });

  it('invokes hooks with driver', async () => {
    const result = await engine.actions.getEventA(5);
    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketEngineDriver), 5);
    expect(result).toEqual(109);
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(engine._nucleus, 'execWaterfall');
    const driver = engine.withDriver();

    const result = await driver.actions.getEventA(5);
    expect(spy).toHaveBeenCalledWith(driver, 'eventA', 5);
    expect(result).toEqual(109);
  });

  it('has expected trace output', async () => {
    await engine.actions.getEventA(5);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ⚡︎ getEventA'],
      ['[0]    ◇ execWaterfall(eventA)'],
      ['[0]    ↪ pluginA:eventA'],
      ['[0]    ↪ pluginB:eventA']
    ]);
  });

  it('allows multiple lifecycle chains', async () => {
    const spy = jest.spyOn(engine._nucleus, 'execWaterfall');
    const promise1 = engine.actions.getEventA(1);
    const promise2 = engine.actions.getEventA(2);

    const [results1, results2] = await Promise.all([promise1, promise2]);

    expect(results1).toEqual(105);
    expect(results2).toEqual(106);
    expect(spy).toHaveBeenCalledTimes(2);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ⚡︎ getEventA'],
      ['[1]  ⚡︎ getEventA'],
      ['[0]    ◇ execWaterfall(eventA)'],
      ['[0]    ↪ pluginA:eventA'],
      ['[0]    ↪ pluginB:eventA'],
      ['[1]    ◇ execWaterfall(eventA)'],
      ['[1]    ↪ pluginA:eventA'],
      ['[1]    ↪ pluginB:eventA']
    ]);
  });

  it('actions can call other actions', async () => {
    const results = await engine.actions.getEvents(5);

    expect(results).toEqual({ a: 109, b: 1005 });
    expect(pluginA.actions.getEventA).toHaveBeenCalled();
    expect(pluginA.actions.getEventB).toHaveBeenCalled();
  });

  it('warns on duplicate action names', () => {
    pluginB.actions = {
      getActionsCount: jest.fn().mockReturnValue('override?')
    };
    engine = new GasketEngine([pluginA, pluginB]);

    expect(errorSpy).toHaveBeenCalledWith(
      'Action \'getActionsCount\' from \'pluginB\' was registered by \'pluginA\''
    );

    const { getActionsCount } = engine.actions;
    expect(getActionsCount()).toEqual(4);

    expect(pluginA.actions.getActionsCount).toHaveBeenCalled();
    expect(pluginB.actions.getActionsCount).not.toHaveBeenCalled();
  });

});
