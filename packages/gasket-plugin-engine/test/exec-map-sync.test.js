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

    engine = new PluginEngine({
      plugins: {
        add: ['a', 'b']
      }
    });
  });

  it('returns an map of results', () => {
    const result = engine.execMapSync('eventA');
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('resolves to an empty array if nothing hooked the event', () => {
    const result = engine.execMapSync('eventB');
    expect(result).toEqual({});
  });

  it('works when invoked without a context', () => {
    const { execMapSync } = engine;

    const result = execMapSync('eventA');

    expect(result).toEqual({ a: 1, b: 2 });
  });
});
