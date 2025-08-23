
const mockDebug = vi.fn();
vi.mock('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace }  = await import('../../lib/trace.js');
const { Gasket }  = await import('../../lib/gasket.js');

describe('The execSync method', () => {
  let mockGasket, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: vi.fn(() => {
          return 1;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: vi.fn(() => {
          return 2;
        })
      }
    };

    mockGasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an map of results', () => {
    const result = mockGasket.execMapSync('eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = mockGasket.execMapSync('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', () => {
    const { execMapSync } = mockGasket;

    const result = execMapSync('eventA');

    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('invokes hooks with isolate', () => {
    mockGasket.execMapSync('eventA');

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketTrace));
  });

  it('branch isolate passed through', () => {
    const spy = vi.spyOn(mockGasket.engine, 'execMapSync');
    const branch = mockGasket.traceBranch();
    const result = branch.execMapSync('eventA');

    expect(spy).toHaveBeenCalledWith(expect.traceProxyOf(branch), 'eventA');
    expect(result).toEqual({ pluginA: 1, pluginB: 2 });
  });

  it('has expected trace output', () => {
    mockDebug.mockClear();
    mockGasket.execMapSync('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◆ execMapSync(eventA)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA']
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
    expect(() => mockGasket.execMapSync('eventA', 5)).toThrow(
      'execMapSync cannot be used with async hook (eventA) of plugin (pluginBad)'
    );
  });
});
