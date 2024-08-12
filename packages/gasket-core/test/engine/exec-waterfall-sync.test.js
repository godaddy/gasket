import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine, GasketEngineDriver }  = await import('../../lib/engine.js');

describe('The execWaterfallSync method', () => {
  let engine, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value * 7;
        }),
        eventB: () => null
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 4;
        }),
        eventB: () => null
      }
    };

    engine = new GasketEngine([pluginA, pluginB]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sequentially transforms a value', () => {
    const result = engine.execWaterfallSync('eventA', 5);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', () => {
    const { execWaterfallSync } = engine;

    const result = execWaterfallSync('eventA', 5);

    expect(result).toEqual(39);
  });

  it('invokes hooks with driver', () => {
    engine.execWaterfallSync('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketEngineDriver), 5);
  });

  it('driver passed through', () => {
    const spy = jest.spyOn(engine._nucleus, 'execWaterfallSync');
    const driver = engine.withDriver();
    const result = driver.execWaterfallSync('eventA', 5);

    expect(spy).toHaveBeenCalledWith(driver, 'eventA', 5);
    expect(result).toEqual(39);
  });

  it('supports additional arguments', () => {
    const otherArg = { some: 'thing' };

    const driver = engine.withDriver();
    const result = driver.execWaterfallSync('eventA', 5, otherArg);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(driver, 5, otherArg);
    expect(pluginB.hooks.eventA).toHaveBeenCalledWith(driver, 35, otherArg);
    expect(result).toEqual(39);
  });

  it('has expected trace output', () => {
    engine.execWaterfallSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◆ execWaterfallSync(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginB:eventA']
    ]);
  });

  it('handles the return of nullish values', () => {
    const { execWaterfallSync } = engine;

    const result = execWaterfallSync('eventB', null);

    expect(result).toEqual(null);
  });
});
