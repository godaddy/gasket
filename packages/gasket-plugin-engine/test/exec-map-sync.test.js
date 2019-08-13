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
      .doMock('@gasket/testa-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/testb-plugin', () => pluginB, { virtual: true });

    const PluginEngine = require('..');
    const Resolver = require('../lib/resolver');
    jest.spyOn(Resolver.prototype, 'tryResolve').mockImplementation(arg => {
      return `${process.cwd()}/node_modules/${arg}`;
    });

    engine = new PluginEngine({
      plugins: {
        add: ['testa', 'testb']
      }
    });
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('returns an map of results', () => {
    const result = engine.execMapSync('eventA');
    expect(result).toEqual({ testa: 1, testb: 2 });
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = engine.execMapSync('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', () => {
    const { execMapSync } = engine;

    const result = execMapSync('eventA');

    expect(result).toEqual({ testa: 1, testb: 2 });
  });
});
