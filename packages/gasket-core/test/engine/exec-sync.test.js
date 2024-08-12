import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine, GasketEngineDriver }  = await import('../../lib/engine.js');


describe('The execSync method', () => {
  let engine, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 1;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn((gasket, value) => {
          return value + 2;
        })
      }
    };

    engine = new GasketEngine([pluginA, pluginB]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an Array of results', () => {
    const result = engine.execSync('eventA', 0);
    expect(result).toEqual([1, 2]);
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = engine.execSync('eventB', 0);
    expect(result).toEqual([]);
  });

  it('works when invoked without a context', () => {
    const { execSync } = engine;

    const result = execSync('eventA', 0);

    expect(result).toEqual([1, 2]);
  });

  it('invokes hooks with driver', () => {
    engine.execSync('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketEngineDriver), 5);
  });

  it('driver passed through', () => {
    const spy = jest.spyOn(engine._nucleus, 'execSync');
    const driver = engine.withDriver();
    const result = driver.execSync('eventA', 5);

    expect(spy).toHaveBeenCalledWith(driver, 'eventA', 5);
    expect(result).toEqual([6, 7]);
  });

  it('has expected trace output', () => {
    engine.execSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◆ execSync(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginB:eventA']
    ]);
  });
});
