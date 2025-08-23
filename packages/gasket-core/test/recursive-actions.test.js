
const mockDebug = vi.fn();
vi.mock('debug', () => ({
  default: () => mockDebug
}));

const { Gasket } = await import('../lib/gasket.js');

describe('recursion', () => {
  let gasket, pluginA, pluginB, pluginNested, pluginDirect, pluginDeep, pluginBranched;
  let waterfallSpy;

  const setupGasket = (...plugins) => {
    gasket = new Gasket({ plugins });
    waterfallSpy = vi.spyOn(gasket.engine, 'execWaterfall');
    vi.spyOn(gasket, 'exec').mockImplementation(async (event, ...args) => {
      if (event === 'ready') {
        return 'mocked ready';
      }
      return gasket.prototype.exec.call(gasket, event, ...args);
    });
    return gasket;
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      actions: {
        startA: vi.fn(async (_gasket, value) => {
          return await _gasket.execWaterfall('eventA', value);
        }),
        startB: vi.fn(async (_gasket, value) => {
          return await _gasket.execWaterfall('eventB', value);
        }),
        startC: vi.fn(async (_gasket, value) => {
          return await _gasket.exec('eventC', value);
        }),
        startD: vi.fn(async (_gasket, value) => {
          return await _gasket.execWaterfall('eventD', value);
        })
      },
      hooks: {
        eventA: vi.fn((_gasket, value) => {
          return value * 7;
        })
      }
    };

    pluginB = {
      name: 'pluginB',
      hooks: {
        eventA: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startB(value)) + 100;
        })
      }
    };

    pluginDirect = {
      name: 'pluginDirect',
      hooks: {
        eventA: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startA(value)) + 100;
        })
      }
    };

    pluginNested = {
      name: 'pluginNested',
      hooks: {
        eventA: vi.fn(async (_gasket, value) => {
          return await (_gasket.traceBranch().actions.startB(value)) + 100;
        }),
        eventB: vi.fn(async (_gasket, value) => {
          return await (_gasket.traceBranch().actions.startA(value)) + 200;
        })
      }
    };

    pluginDeep = {
      name: 'pluginDeep',
      hooks: {
        eventA: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startB(value)) + 100;
        }),
        eventB: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startC(value)) + 200;
        }),
        eventC: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startD(value)) + 300;
        }),
        eventD: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startA(value)) + 400;
        })
      }
    };

    pluginBranched = {
      name: 'pluginBranched',
      hooks: {
        eventA: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startB(value)) + 100;
        }),
        eventB: vi.fn(async (_gasket, value) => {
          return await (_gasket.actions.startA(value)) + 200;
        })
      }
    };

    setupGasket(pluginA, pluginB);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('allows sequential varying actions', async () => {
    const result = await gasket.actions.startA(5);
    expect(result).toEqual(135);
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on direct recursive action', async () => {
    setupGasket(pluginA, pluginDirect);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on nested recursive action', async () => {
    setupGasket(pluginA, pluginNested);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startB -> execWaterfall(eventB) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on deeply nested recursive action', async () => {
    setupGasket(pluginA, pluginDeep);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startB -> execWaterfall(eventB) -> ' +
        'startC -> exec(eventC) -> startD -> execWaterfall(eventD) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('throws on branched recursive action', async () => {
    setupGasket(pluginA, pluginBranched);

    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow('startA -> execWaterfall(eventA) -> startB -> execWaterfall(eventB) -> startA');
    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('allows multiple action chains from root', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const promise1 = gasket.actions.startA(1);
    const promise2 = gasket.actions.startA(2);
    const promise3 = gasket.actions.startA(3);

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

  it('does not throw on multiple actions in a branch', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const branch = gasket.traceBranch();
    await branch.actions.startA(1);
    await branch.actions.startA(2);

    expect(waterfallSpy).toHaveBeenCalled();
  });

  it('allows multiple action chains from subbranches', async () => {
    setupGasket(pluginA);
    gasket.config = { some: 'config' };

    const branch = gasket.traceBranch();
    const promise1 = branch.actions.startA(1);
    const promise2 = branch.actions.startA(2);
    const promise3 = branch.actions.startA(3);

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
    await expect(async () => gasket.actions.startA(5))
      .rejects.toThrow();

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['  ★ startA'],
      ['    ◇ execWaterfall(eventA)'],
      ['    ↪ pluginA:eventA'],
      ['    ↪ pluginDeep:eventA'],
      ['      ★ startB'],
      ['        ◇ execWaterfall(eventB)'],
      ['        ↪ pluginDeep:eventB'],
      ['          ★ startC'],
      ['            ◇ exec(eventC)'],
      ['            ↪ pluginDeep:eventC'],
      ['              ★ startD'],
      ['                ◇ execWaterfall(eventD)'],
      ['                ↪ pluginDeep:eventD'],
      ['                  ★ startA']
    ]);
  });
});
