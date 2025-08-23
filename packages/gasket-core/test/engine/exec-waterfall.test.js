
const mockDebug = vi.fn();
vi.mock('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace } = await import('../../lib/trace.js');
const { Gasket } = await import('../../lib/gasket.js');

describe('The execWaterfall method', () => {
  let mockGasket, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      hooks: {
        eventA: vi.fn((gasket, value) => {
          return value * 7;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: vi.fn((gasket, value) => {
          return value + 4;
        })
      }
    };

    mockGasket = new Gasket({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sequentially transforms a value', async () => {
    const result = await mockGasket.execWaterfall('eventA', 5);
    expect(result).toEqual(39);
  });

  it('works when invoked without a context', async () => {
    const { execWaterfall } = mockGasket;

    const result = await execWaterfall('eventA', 5);

    expect(result).toEqual(39);
  });

  it('invokes hooks with isolate', async () => {
    const result = await mockGasket.execWaterfall('eventA', 5);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.any(GasketTrace), 5);
    expect(result).toEqual(39);
  });

  it('branch isolate passed through', async () => {
    const spy = vi.spyOn(mockGasket.engine, 'execWaterfall');
    const branch = mockGasket.traceBranch();

    const result = await branch.execWaterfall('eventA', 5);
    expect(spy).toHaveBeenCalledWith(expect.traceProxyOf(branch), 'eventA', 5);
    expect(result).toEqual(39);
  });

  it('supports additional arguments', async () => {
    const otherArg = { some: 'thing' };

    const branch = mockGasket.traceBranch();
    const result = await branch.execWaterfall('eventA', 5, otherArg);

    expect(pluginA.hooks.eventA).toHaveBeenCalledWith(expect.traceProxyOf(branch), 5, otherArg);
    expect(pluginB.hooks.eventA).toHaveBeenCalledWith(expect.traceProxyOf(branch), 35, otherArg);
    expect(result).toEqual(39);
  });

  it('has expected trace output', async () => {
    mockDebug.mockClear();
    await mockGasket.execWaterfall('eventA', 5);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ◇ execWaterfall(eventA)'],
      ['⋌ root'],
      ['  ◇ exec(ready)'],
      ['  ↪ pluginA:eventA'],
      ['  ↪ pluginB:eventA']
    ]);
  });
});
