async function pause(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

describe('The exec method', () => {
  let engine, hookASpy, hookBSpy;

  const mockConfig = {
    some: 'config'
  };

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
        handler: async function () {
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
        handler: async function () {
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
        handler: async function () {
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

    const { Loader } = require('@gasket/resolve');
    jest.spyOn(Loader.prototype, 'loadConfigured').mockImplementation(() => {
      return {
        plugins: [
          { module: pluginA },
          { module: pluginB }
        ]
      };
    });

    const PluginEngine = require('..');
    engine = new PluginEngine(mockConfig);
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('passes the gasket config to each hook', async () => {
    await engine.exec('eventA');

    expect(hookASpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
    expect(hookBSpy.mock.calls[0][0]).toHaveProperty('config', mockConfig);
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

  it('should await if ordered', async function () {
    const result = await engine.exec('eventB');

    expect(result).toEqual([
      expect.objectContaining({ value: 'B' }),
      expect.objectContaining({ value: 'A' })
    ]);

    const [resultsB, resultsA] = result;
    expect(resultsA.start).toBeGreaterThanOrEqual(resultsB.end);
  });

  it('should await if ordered within first grouping', async function () {
    const result = await engine.exec('eventC');

    expect(result).toEqual([
      expect.objectContaining({ value: 'B' }),
      expect.objectContaining({ value: 'A' })
    ]);

    const [resultsB, resultsA] = result;
    expect(resultsA.start).toBeGreaterThanOrEqual(resultsB.end);
  });
});
