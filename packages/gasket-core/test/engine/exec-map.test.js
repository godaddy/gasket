import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketEngine, GasketEngineDriver }  = await import('../../lib/engine.js');


describe('The execMap method', () => {
  let engine, hookASpy, hookBSpy, hookCSpy;

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA() {
        return Promise.resolve(1);
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA() {
        return 2;
      }
    }
  };

  const pluginC = {
    name: 'pluginC',
    hooks: {
      eventA: {
        timing: { after: ['pluginA'] },
        handler: () => 3
      }
    }
  };

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    engine = new GasketEngine([pluginA, pluginB, pluginC]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes hooks with driver', async () => {
    await engine.execMap('eventA');

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver));
    expect(hookBSpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver));
    expect(hookCSpy).toHaveBeenCalledWith(expect.any(GasketEngineDriver));
  });

  it('driver passed through', async () => {
    const spy = jest.spyOn(engine._nucleus, 'execMap');
    const driver = engine.withDriver();

    const result = await driver.execMap('eventA');
    expect(spy).toHaveBeenCalledWith(driver, 'eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });

  it('awaits sync or async hooks and resolves a map object', async () => {
    const result = await engine.execMap('eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });

  it('resolves to an empty object if nothing hooked the event', async () => {
    const result = await engine.execMap('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', async () => {
    const { execMap } = engine;

    const result = await execMap('eventA');

    expect(result).toEqual({ pluginA: 1, pluginB: 2, pluginC: 3 });
  });

  it('has expected trace output', async () => {
    await engine.execMap('eventA');

    expect(mockDebug.mock.calls).toEqual([
      ['[0]  ◇ execMap(eventA)'],
      ['[0]  ↪ pluginA:eventA'],
      ['[0]  ↪ pluginB:eventA'],
      ['[0]  ↪ pluginC:eventA']
    ]);
  });
});
