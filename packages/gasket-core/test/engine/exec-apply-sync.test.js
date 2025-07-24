import { jest } from '@jest/globals';

const mockDebug = jest.fn();
jest.unstable_mockModule('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace }  = await import('../../lib/trace.js');
const { Gasket }  = await import('../../lib/gasket.js');

// eslint-disable-next-line max-statements
describe('The execApplySync method', () => {
  let mockGasket, hookASpy, hookBSpy, hookCSpy;

  const Wrapper = class Wrapper {
    constructor(plugin) {
      this.plugin = plugin;
    }
  };

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA(eng, arg, lit) {
        return { arg, lit };
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA(eng, arg) {
        return arg;
      }
    }
  };

  const pluginC = {
    name: 'pluginC',
    hooks: {
      eventA: {
        timing: { after: ['pluginA'] },
        handler: (eng, arg) => arg
      }
    }
  };

  /**
   *
   * @param plugin
   * @param handler
   */
  function mockApplyHandler(plugin, handler) {
    return handler(new Wrapper(plugin));
  }

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');
    hookCSpy = jest.spyOn(pluginC.hooks.eventA, 'handler');

    mockGasket = new Gasket({ plugins: [pluginA, pluginB, pluginC] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes hooks with isolate', () => {
    mockGasket.execApplySync('eventA', mockApplyHandler);

    expect(hookASpy).toHaveBeenCalledWith(expect.any(GasketTrace), expect.any(Wrapper));
    expect(hookBSpy).toHaveBeenCalledWith(expect.any(GasketTrace), expect.any(Wrapper));
    expect(hookCSpy).toHaveBeenCalledWith(expect.any(GasketTrace), expect.any(Wrapper));
  });

  it('branch isolate passed through', () => {
    const spy = jest.spyOn(mockGasket.engine, 'execApplySync');
    const branch = mockGasket.traceBranch();

    branch.execApplySync('eventA', mockApplyHandler);

    expect(spy).toHaveBeenCalledWith(expect.traceProxyOf(branch), 'eventA', mockApplyHandler);
  });

  it('returns an Array of results', () => {
    const result = mockGasket.execApplySync('eventA', mockApplyHandler);

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('accepts thunks and literal argument values when resolving an Array', () => {
    const result = mockGasket.execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin), 'literal');
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[0].lit).toEqual('literal');
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = mockGasket.execApplySync('eventB', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toEqual([]);
  });

  it('works when invoked without a context', () => {
    const { execApplySync } = mockGasket;

    const result = execApplySync('eventA', (plugin, handler) => {
      return handler(new Wrapper(plugin));
    });

    expect(result).toHaveLength(3);
    expect(result[0].arg.plugin).toMatchObject(pluginA);
    expect(result[1].plugin).toMatchObject(pluginB);
    expect(result[2].plugin).toMatchObject(pluginC);
  });

  it('can be executed with differing callbacks', () => {
    const stub1 = jest.fn().mockImplementation((plugin, handler) => handler());
    const stub2 = jest.fn().mockImplementation((plugin, handler) => handler());

    mockGasket.execApplySync('eventA', stub1);
    mockGasket.execApplySync('eventA', stub2);

    expect(stub1).toHaveBeenCalledTimes(3);
    expect(stub2).toHaveBeenCalledTimes(3);
  });

  it('has expected trace output', () => {
    mockDebug.mockClear();
    mockGasket.execApplySync('eventA', mockApplyHandler);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◆ execApplySync(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA'],
      ['  ↪ pluginC:eventA']
    ]);
  });

  it('throws for async hooks', () => {
    const pluginBad = {
      name: 'pluginBad',
      hooks: {
        async eventA(gasket, value) {
          return value * 10;
        }
      }
    };
    mockGasket = new Gasket({ plugins: [pluginA, pluginB, pluginBad] });
    expect(() => mockGasket.execApplySync('eventA', mockApplyHandler)).toThrow(
      'execApplySync cannot be used with async hook (eventA) of plugin (pluginBad)'
    );
  });
});
