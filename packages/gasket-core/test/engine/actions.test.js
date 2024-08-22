import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace }  = await import('../../lib/branch.js');
const { Gasket }  = await import('../../lib/gasket.js');

const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
});

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('actions', () => {
  let mockGasket, pluginA, pluginB;

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

    mockGasket = new Gasket({ plugins: [pluginA, pluginB] });
    mockDebug.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('actions are registered', async () => {
    expect(mockGasket.actions).toBeDefined();
    expect(mockGasket.actions.getActionsCount).toEqual(expect.any(Function));
    expect(mockGasket.actions.getEventA).toEqual(expect.any(Function));
  });

  it('sequentially transforms a value',  () => {
    const result = mockGasket.actions.getActionsCount();
    expect(result).toEqual(4);
  });

  it('works when invoked without a context', () => {
    const { getActionsCount } = mockGasket.actions;
    const result = getActionsCount();
    expect(result).toEqual(4);
  });

  it('invokes hooks with isolate', async () => {
    const result = await mockGasket.actions.getEventA(5);
    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketTrace), 5);
    expect(result).toEqual(109);
  });

  it('branch isolate passed through', async () => {
    const spy = jest.spyOn(mockGasket.engine, 'execWaterfall');
    const branch = mockGasket.traceBranch();

    const result = await branch.actions.getEventA(5);
    expect(spy).toHaveBeenCalledWith(expect.traceProxyOf(branch), 'eventA', 5);
    expect(result).toEqual(109);
  });

  it('has expected trace output', async () => {
    await mockGasket.actions.getEventA(5);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ★ getEventA'],
      ['    ◇ execWaterfall(eventA)'],
      ['    ↪ pluginA:eventA'],
      ['    ↪ pluginB:eventA']
    ]);
  });

  it('allows multiple lifecycle chains', async () => {
    const spy = jest.spyOn(mockGasket.engine, 'execWaterfall');
    const promise1 = mockGasket.actions.getEventA(1);
    const promise2 = mockGasket.actions.getEventA(2);

    const [results1, results2] = await Promise.all([promise1, promise2]);

    expect(results1).toEqual(105);
    expect(results2).toEqual(106);
    expect(spy).toHaveBeenCalledTimes(2);

    expect(mockDebug.mock.calls).toEqual(
      [
        ['⋌ root'],
        ['  ★ getEventA'],
        ['⋌ root'],
        ['  ★ getEventA'],
        ['    ◇ execWaterfall(eventA)'],
        ['    ↪ pluginA:eventA'],
        ['    ↪ pluginB:eventA'],
        ['    ◇ execWaterfall(eventA)'],
        ['    ↪ pluginA:eventA'],
        ['    ↪ pluginB:eventA']
      ]
    );
  });

  it('actions can call other actions', async () => {
    const results = await mockGasket.actions.getEvents(5);

    expect(results).toEqual({ a: 109, b: 1005 });
    expect(pluginA.actions.getEventA).toHaveBeenCalled();
    expect(pluginA.actions.getEventB).toHaveBeenCalled();
  });

  it('warns on duplicate action names', () => {
    pluginB.actions = {
      getActionsCount: jest.fn().mockReturnValue('override?')
    };
    mockGasket = new Gasket({ plugins: [pluginA, pluginB] });

    expect(errorSpy).toHaveBeenCalledWith(
      'Action \'getActionsCount\' from \'pluginB\' was registered by \'pluginA\''
    );

    const { getActionsCount } = mockGasket.actions;
    expect(getActionsCount()).toEqual(4);

    expect(pluginA.actions.getActionsCount).toHaveBeenCalled();
    expect(pluginB.actions.getActionsCount).not.toHaveBeenCalled();
  });

});
