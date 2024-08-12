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
        eventA: jest.fn(() => {
          return 1;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: jest.fn(() => {
          return 2;
        })
      }
    };

    engine = new GasketEngine([pluginA, pluginB]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an map of results', () => {
    const result = engine.execMapSync('eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = engine.execMapSync('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', () => {
    const { execMapSync } = engine;

    const result = execMapSync('eventA');

    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('invokes hooks with driver', () => {
    engine.execMapSync('eventA');

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketEngineDriver));
  });

  it('driver passed through', () => {
    const spy = jest.spyOn(engine._nucleus, 'execMapSync');
    const driver = engine.withDriver();
    const result = driver.execMapSync('eventA');

    expect(spy).toHaveBeenCalledWith(driver, 'eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('has expected trace output', () => {
    engine.execMapSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◆ execMapSync(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginB:eventA']
    ]);
  });
});
