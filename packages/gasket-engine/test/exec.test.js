async function pause(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

describe('The exec method', () => {
  let engine, hookASpy, hookBSpy;

  const pluginA = {
    name: 'pluginA',
    hooks: {
      eventA() {
        return Promise.resolve(1);
      },
      eventB: {
        timing: {
          after: ['pluginB']
        },
        async handler() {
          const start = Date.now();
          await pause(10);
          return {
            value: 'A',
            start,
            end: Date.now()
          };
        }
      },
      eventC: {
        timing: {
          first: true
        },
        async handler() {
          const start = Date.now();
          await pause(10);
          return {
            value: 'A',
            start,
            end: Date.now()
          };
        }
      }
    }
  };

  const pluginB = {
    name: 'pluginB',
    hooks: {
      eventA() {
        return 2;
      },
      async eventB() {
        const start = Date.now();
        await pause(10);
        return {
          value: 'B',
          start,
          end: Date.now()
        };
      },
      eventC: {
        timing: {
          first: true,
          before: ['pluginA']
        },
        async handler() {
          const start = Date.now();
          await pause(10);
          return {
            value: 'B',
            start,
            end: Date.now()
          };
        }
      }
    }
  };

  beforeEach(() => {
    hookASpy = jest.spyOn(pluginA.hooks, 'eventA');
    hookBSpy = jest.spyOn(pluginB.hooks, 'eventA');

    const GasketEngine = require('..');
    engine = new GasketEngine([pluginA, pluginB]);
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('passes the gasket instance to each hook', async () => {
    await engine.exec('eventA');

    expect(hookASpy).toHaveBeenCalledWith(engine);
    expect(hookBSpy).toHaveBeenCalledWith(engine);
  });

  it('awaits sync or async hooks and resolves an Array', async () => {
    const result = await engine.exec('eventA');
    expect(result).toEqual([1, 2]);
  });

  it('resolves to an empty array if nothing hooked the event', async () => {
    const result = await engine.exec('eventMissing');
    expect(result).toEqual([]);
  });

  it('works when invoked without a context', async () => {
    const { exec } = engine;

    const result = await exec('eventA');

    expect(result).toEqual([1, 2]);
  });

  it('does not cause unhandled rejections on thrown errors', async () => {
    engine.hook({
      event: 'mock',
      async handler() {
        throw new Error('I am rejecting you');
      }
    });

    await expect(engine.exec('mock')).rejects.toThrow(Error);
  });

  it('should await if ordered', async () => {
    const result = await engine.exec('eventB');

    expect(result).toEqual([
      expect.objectContaining({ value: 'B' }),
      expect.objectContaining({ value: 'A' })
    ]);

    const [resultsB, resultsA] = result;
    expect(resultsA.start).toBeGreaterThanOrEqual(resultsB.end);
  });

  it('should await if ordered within first grouping', async () => {
    const result = await engine.exec('eventC');

    expect(result).toEqual([
      expect.objectContaining({ value: 'B' }),
      expect.objectContaining({ value: 'A' })
    ]);

    const [resultsB, resultsA] = result;
    expect(resultsA.start).toBeGreaterThanOrEqual(resultsB.end);
  });
});
