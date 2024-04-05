describe('The execSync method', () => {
  let engine;

  beforeEach(() => {
    const pluginA = {
      name: 'pluginA',
      hooks: {
        eventA() {
          return 1;
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

    const PluginEngine = require('../lib/engine');
    engine = new PluginEngine({ plugins: [pluginA, pluginB] });
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('returns an Array of results', () => {
    const result = engine.execSync('eventA');
    expect(result).toEqual([1, 2]);
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = engine.execSync('eventB');
    expect(result).toEqual([]);
  });

  it('works when invoked without a context', () => {
    const { execSync } = engine;

    const result = execSync('eventA');

    expect(result).toEqual([1, 2]);
  });
});
