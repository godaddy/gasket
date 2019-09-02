describe('The execSync method', () => {
  let engine;

  const mockConfig = {
    some: 'config'
  };

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
});
