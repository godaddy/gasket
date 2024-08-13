import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { Gasket }  = await import('../../lib/gasket.js');

describe('recursion', () => {
  let gasket, pluginA, pluginB, pluginNested, pluginDirect, pluginDeep;
  let waterfallSpy;

  const setupEngine = (...plugins) => {
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
      name: 'pluginD',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventA', value)) + 100;
        })
      }
    };

    pluginNested = {
      name: 'pluginC',
      hooks: {
        eventA: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventB', value)) + 100;
        }),
        eventB: jest.fn(async (_gasket, value) => {
          return await (_gasket.execWaterfall('eventA', value)) + 200;
        })
      }
    };

    pluginDeep = {
      name: 'pluginE',
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

    setupEngine(pluginA, pluginB);
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
    setupEngine(pluginA, pluginDirect);

    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventA)');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on nested recursive lifecycle', async () => {
    setupEngine(pluginA, pluginNested);

    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventB) -> execWaterfall(eventA)');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on deeply nested recursive lifecycle', async () => {
    setupEngine(pluginA, pluginDeep);

    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventB) -> ' +
        'exec(eventC) -> execWaterfall(eventD) -> execWaterfall(eventA)');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('allows multiple lifecycle chains', async () => {
    setupEngine(pluginA);
    gasket.config = { some: 'config' };

    const promise1 = gasket.execWaterfall('eventA', 1);
    const promise2 = gasket.execWaterfall('eventA', 2);

    const [results1, results2] = await Promise.all([promise1, promise2]);

    expect(results1).toEqual(7);
    expect(results2).toEqual(14);
    expect(waterfallSpy).toHaveBeenCalledTimes(2);
  });

  it('has expected trace output', async () => {
    setupEngine(pluginA, pluginDeep);

    mockDebug.mockClear();
    await expect(async () => gasket.execWaterfall('eventA', 5))
      .rejects.toThrow();

    expect(mockDebug.mock.calls).toEqual([
      ['[2]  ◇ execWaterfall(eventA)'],
      ['[2]  ↪ pluginA:eventA'],
      ['[2]  ↪ pluginE:eventA'],
      ['[2]    ◇ execWaterfall(eventB)'],
      ['[2]    ↪ pluginE:eventB'],
      ['[2]      ◇ exec(eventC)'],
      ['[2]      ↪ pluginE:eventC'],
      ['[2]        ◇ execWaterfall(eventD)'],
      ['[2]        ↪ pluginE:eventD']
    ]);
  });
});
