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
          return await (_gasket.execWaterfall('eventB', value)) + 100;
        })
      }
    };

    pluginDirect = {
      name: 'pluginDirect',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventA', value)) + 100;
        })
      }
    };

    pluginNested = {
      name: 'pluginNested',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.branch().execWaterfall('eventB', value)) + 100;
        }),
        eventB: jest.fn(async (_gasket, value) => {
          return await (_gasket.branch().execWaterfall('eventA', value)) + 200;
        })
      }
    };

    pluginDeep = {
      name: 'pluginDeep',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventB', value)) + 100;
        }),
        eventB: jest.fn(async (_gasket, value) => {
          return await (_gasket.exec('eventC', value)) + 200;
        }),
        eventC: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventD', value)) + 300;
        }),
        eventD: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventA', value)) + 400;
        })
      }
    };

    pluginBranched = {
      name: 'pluginBranched',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventB', value)) + 100;
        }),
        eventB: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventA', value)) + 200;
        })
      }
    };

    setupGasket(pluginA, pluginB);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows sequential varying lifecycles', async () => {
    const result = await gasket.execWaterfall('eventA', 5);
    expect(result).toEqual(135);
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on direct recursive lifecycle', async () => {
    setupGasket(pluginA, pluginDirect);

    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventA)');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on nested recursive lifecycle', async () => {
    setupGasket(pluginA, pluginNested);

    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventB) -> execWaterfall(eventA)');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on deeply nested recursive lifecycle', async () => {
    setupGasket(pluginA, pluginDeep);

    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventB) -> ' +
        'exec(eventC) -> execWaterfall(eventD) -> execWaterfall(eventA)');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on branched recursive lifecycle', async () => {
    setupGasket(pluginA, pluginBranched);

    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventB) -> execWaterfall(eventA)');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('allows multiple lifecycle chains from root', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const promise1 = gasket.execWaterfall('eventA', 1);
    const promise2 = gasket.execWaterfall('eventA', 2);
    const promise3 = gasket.execWaterfall('eventA', 3);

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

  it('allows multiple lifecycle chains from subbranches', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const branch = gasket.branch();
    const promise1 = branch.branch().execWaterfall('eventA', 1);
    const promise2 = branch.branch().execWaterfall('eventA', 2);
    const promise3 = branch.branch().execWaterfall('eventA', 3);

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

  it('allows multiple lifecycle executes from a branch', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const branch = gasket.branch();
    const promise1 = branch.execWaterfall('eventA', 1);
    const promise2 = branch.execWaterfall('eventA', 2);
    const promise3 = branch.execWaterfall('eventA', 3);

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
    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow();

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◇ execWaterfall(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginDeep:eventA'],
      ['    ◇ execWaterfall(eventB)'],
      ['    ↪ pluginDeep:eventB'],
      ['      ◇ exec(eventC)'],
      ['      ↪ pluginDeep:eventC'],
      ['        ◇ execWaterfall(eventD)'],
      ['        ↪ pluginDeep:eventD']
    ]);
  });
});
