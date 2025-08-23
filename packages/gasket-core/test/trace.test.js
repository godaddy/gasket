import { lifecycleMethods } from '../lib/engine.js';

const mockDebug = vi.fn();
vi.mock('debug', () => ({
  default: () => mockDebug
}));

const { GasketTrace } = await import('../lib/trace.js');
const { Gasket } = await import('../lib/gasket.js');

describe('GasketTrace', () => {
  let gasket, pluginA, pluginB;

  beforeEach(() => {
    pluginA = {
      name: 'pluginA',
      actions: {
        getActionsCount: vi.fn((_gasket) => {
          return Object.keys(_gasket.actions).length;
        }),
        getEventA: vi.fn(async (_gasket, value) => {
          return _gasket.execWaterfall('eventA', value);
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
        eventA: vi.fn((_gasket, value) => {
          return value + 4;
        })
      }
    };

    gasket = new Gasket({ plugins: [pluginA, pluginB] });
    vi.spyOn(gasket, 'exec').mockImplementation(async (event, ...args) => {
      if (event === 'ready') {
        return 'mocked ready';
      }
      return gasket.prototype.exec.call(gasket, event, ...args);
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    GasketTrace._nextBranchId = 0;
  });

  it('can get a branch from a gasket', () => {
    const branch = gasket.traceBranch();
    expect(branch).toBeInstanceOf(GasketTrace);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root']
    ]);
  });

  it('can get a branch from a branch', () => {
    const branch = gasket.traceBranch();
    const subBranch = branch.traceBranch();
    const subBranch2 = subBranch.traceBranch();
    const subBranch3 = subBranch2.traceBranch();
    expect(subBranch3).toBeInstanceOf(GasketTrace);

    expect(mockDebug.mock.calls).toEqual([
      ['⋌ root'],
      ['⋌ 3'],
      ['⋌ 4'],
      ['⋌ 5']
    ]);
  });

  it('can access lifecycles', () => {
    const branch = gasket.traceBranch();
    lifecycleMethods.forEach(method => {
      expect(branch[method]).toBeInstanceOf(Function);
    });
  });

  it('can access actions', () => {
    const branch = gasket.traceBranch();
    expect(branch.actions).toEqual({
      getActionsCount: expect.any(Function),
      getEventA: expect.any(Function)
    });
  });

  it('can access config', () => {
    const branch = gasket.traceBranch();
    expect(branch.config).toBe(gasket.config);
  });

  it('can access root from a branch', () => {
    const root = gasket.traceBranch().traceRoot();
    expect(root).toBe(gasket);

    const deepRoot = gasket.traceBranch().traceBranch().traceBranch().traceRoot();
    expect(deepRoot).toBe(gasket);
  });

  it('Gasket implements traceRoot', () => {
    const root = gasket.traceRoot();
    expect(root).toBe(gasket);
  });

  it('can attach arbitrary properties', () => {
    const branch = gasket.traceBranch();
    const branch2 = gasket.traceBranch();

    // attaching in a branch affects the original
    branch.extra = true;
    expect(branch.extra).toBe(true);

    // found on original
    expect(gasket.extra).toBe(true);

    // accessible in another branch
    expect(branch2.extra).toBe(true);

    // accessible in subbranch
    expect(branch2.traceBranch().extra).toBe(true);
  });
});
