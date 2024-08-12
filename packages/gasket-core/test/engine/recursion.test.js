import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine }  = await import('../../lib/engine.js');

describe('recursion', () => {
  let engine, pluginA, pluginB, pluginNested, pluginDirect, pluginDeep;
  let waterfallSpy;

  const setupEngine = (...plugins) => {
    engine = new GasketEngine(plugins);
    waterfallSpy = jest.spyOn(engine._nucleus, 'execWaterfall');
    return engine;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value * 7;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn(async (gasket, value) => {
          return await (gasket.execWaterfall('eventB', value)) + 100;
        })
      }
    };

    pluginDirect = {
      name: 'pluginD',
      hooks: {
        eventA: jest.fn(async (gasket, value) => {
          return await (gasket.execWaterfall('eventA', value)) + 100;
        })
      }
    };

    pluginNested = {
      name: 'pluginC',
      hooks: {
        eventA: jest.fn(async (gasket, value) => {
          return await (gasket.execWaterfall('eventB', value)) + 100;
        }),
        eventB: jest.fn(async (gasket, value) => {
          return await (gasket.execWaterfall('eventA', value)) + 200;
        })
      }
    };

    pluginDeep = {
      name: 'pluginE',
      hooks: {
        eventA: jest.fn(async (gasket, value) => {
          return await (gasket.execWaterfall('eventB', value)) + 100;
        }),
        eventB: jest.fn(async (gasket, value) => {
          return await (gasket.exec('eventC', value)) + 200;
        }),
        eventC: jest.fn(async (gasket, value) => {
          return await (gasket.execWaterfall('eventD', value)) + 300;
        }),
        eventD: jest.fn(async (gasket, value) => {
          return await (gasket.execWaterfall('eventA', value)) + 400;
        })
      }
    };

    setupEngine(pluginA, pluginB);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows sequential varying lifecycles', async () => {
    const result = await engine.execWaterfall('eventA', 5);
    expect(result).toEqual(135);
    expect(waterfallSpy).toHaveBeenCalledTimes(2);
  });

  it('throws on direct recursive lifecycle', async () => {
    setupEngine(pluginA, pluginDirect);

    await expect(async () => engine.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventA)');

    expect(waterfallSpy).toHaveBeenCalledTimes(2);
  });

  it('throws on nested recursive lifecycle', async () => {
    setupEngine(pluginA, pluginNested);

    await expect(async () => engine.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventB) -> execWaterfall(eventA)');

    expect(waterfallSpy).toHaveBeenCalledTimes(3);
  });

  it('throws on deeply nested recursive lifecycle', async () => {
    setupEngine(pluginA, pluginDeep);

    await expect(async () => engine.execWaterfall('eventA', 5))
      .rejects.toThrow('execWaterfall(eventA) -> execWaterfall(eventB) -> ' +
        'exec(eventC) -> execWaterfall(eventD) -> execWaterfall(eventA)');

    expect(waterfallSpy).toHaveBeenCalledTimes(4);
  });

  it('allows multiple lifecycle chains', async () => {
    setupEngine(pluginA);
    engine.config = { some: 'config' };

    const promise1 = engine.execWaterfall('eventA', 1);
    const promise2 = engine.execWaterfall('eventA', 2);

    const [results1, results2] = await Promise.all([promise1, promise2]);

    expect(results1).toEqual(7);
    expect(results2).toEqual(14);
    expect(waterfallSpy).toHaveBeenCalledTimes(2);
  });

  it('has expected trace output', async () => {
    setupEngine(pluginA, pluginDeep);

    await expect(async () => engine.execWaterfall('eventA', 5))
      .rejects.toThrow();

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◇ execWaterfall(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginE:eventA'],
      ['[0]    ◇ execWaterfall(eventB)'],
      ['[0]    ↪ pluginE:eventB'],
      ['[0]      ◇ exec(eventC)'],
      ['[0]      ↪ pluginE:eventC'],
      ['[0]        ◇ execWaterfall(eventD)'],
      ['[0]        ↪ pluginE:eventD']
    ]);
  });
});
