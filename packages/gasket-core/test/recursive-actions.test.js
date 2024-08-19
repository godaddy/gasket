import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { Gasket } = await import('../lib/gasket.js');

describe('recursion', () => {
  let gasket, pluginA, pluginB, pluginNested, pluginDirect, pluginDeep, pluginBranched;
  let waterfallSpy;

  const setupGasket = (...plugins) => {
    gasket = new Gasket({ plugins });
    waterfallSpy = jest.spyOn(gasket.engine, 'execWaterfall');
    return gasket;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      actions: {
        startA: jest.fn(async (_gasket, value) => {
          return await _gasket.execWaterfall('eventA', value);
        }),
        startB: jest.fn(async (_gasket, value) => {
          return await _gasket.execWaterfall('eventB', value);
        }),
        startC: jest.fn(async (_gasket, value) => {
          return await _gasket.exec('eventC', value);
        }),
        startD: jest.fn(async (_gasket, value) => {
          return await _gasket.execWaterfall('eventD', value);
        })
      },
      hooks: {
        eventA: jest.fn((_gasket, value) => {
          return value * 7;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startB(value)) + 100;
        })
      }
    };

    pluginDirect = {
      name: 'pluginDirect',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startA(value)) + 100;
        })
      }
    };

    pluginNested = {
      name: 'pluginNested',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.branch().actions.startB(value)) + 100;
        }),
        eventB: jest.fn(async (_gasket, value) => {
          return await (_gasket.branch().actions.startA(value)) + 200;
        })
      }
    };

    pluginDeep = {
      name: 'pluginDeep',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startB(value)) + 100;
        }),
        eventB: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startC(value)) + 200;
        }),
        eventC: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startD(value)) + 300;
        }),
        eventD: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startA(value)) + 400;
        })
      }
    };

    pluginBranched = {
      name: 'pluginBranched',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startB(value)) + 100;
        }),
        eventB: jest.fn(async (_gasket, value) => {
          return await (_gasket.actions.startA(value)) + 200;
        })
      }
    };

    setupGasket(pluginA, pluginB);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows sequential varying actions', async () => {
    const result = await gasket.actions.startA(5);
    expect(result).toEqual(135);
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on direct recursive action', async () => {
    setupGasket(pluginA, pluginDirect);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on nested recursive action', async () => {
    setupGasket(pluginA, pluginNested);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startB -> execWaterfall(eventB) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on deeply nested recursive action', async () => {
    setupGasket(pluginA, pluginDeep);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startB -> execWaterfall(eventB) -> ' +
        'startC -> exec(eventC) -> startD -> execWaterfall(eventD) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on branched recursive action', async () => {
    setupGasket(pluginA, pluginBranched);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startB -> execWaterfall(eventB) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('allows multiple action chains from root', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const promise1 = gasket.actions.startA(1);
    const promise2 = gasket.actions.startA(2);
    const promise3 = gasket.actions.startA(3);

    const [
      results1,
      results2,
      results3
    ] = await Promise.all([promise1, promise2, promise3]);

    expect(results1).toEqual(7);
    expect(results2).toEqual(14);
    expect(results3).toEqual(21);
    expect(waterfallSpy).toHaveBeenCalledTimes(3);
  });

  it('throws on multiple actions in a branch', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const branch = gasket.branch();
    branch.actions.startA(1);

    await expect(async () => branch.actions.startA(2))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startA');

    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('allows multiple action chains from subbranches', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const branch = gasket.branch();
    const promise1 = branch.branch().actions.startA(1);
    const promise2 = branch.branch().actions.startA(2);
    const promise3 = branch.branch().actions.startA(3);

    const [
      results1,
      results2,
      results3
    ] = await Promise.all([promise1, promise2, promise3]);

    expect(results1).toEqual(7);
    expect(results2).toEqual(14);
    expect(results3).toEqual(21);
    expect(waterfallSpy).toHaveBeenCalledTimes(3);
  });

  it('has expected trace output', async () => {
    setupGasket(pluginA, pluginDeep);

    mockDebug.mockClear();
    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow();

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ★ startA'],
      ['    ◇ execWaterfall(eventA)'],
      ['    ↪ pluginA:eventA'],
      ['    ↪ pluginDeep:eventA'],
      ['      ★ startB'],
      ['        ◇ execWaterfall(eventB)'],
      ['        ↪ pluginDeep:eventB'],
      ['          ★ startC'],
      ['            ◇ exec(eventC)'],
      ['            ↪ pluginDeep:eventC'],
      ['              ★ startD'],
      ['                ◇ execWaterfall(eventD)'],
      ['                ↪ pluginDeep:eventD']
    ]);
  });
});
