describe('The execSync method', () => {
  let engine;

  beforeEach(() => {
    const pluginA = {
      hooks: {
        eventA() {
          return 1;
        }
      }
    };

    const pluginB = {
      hooks: {
        eventA() {
          return 2;
        }
      }
    };

    jest
      .doMock('@gasket/a-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/b-plugin', () => pluginB, { virtual: true });

    const PluginEngine = require('..');
    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });

    engine = new PluginEngine({
      plugins: {
        add: ['a', 'b']
      }
    });
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
