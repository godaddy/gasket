const PluginEngine = require('../lib/engine');
const Resolver = require('../lib/resolver');

describe('The hook method', () => {

  beforeEach(() => {
    jest.spyOn(Resolver.prototype, 'tryResolve').mockImplementation(arg => {
      return `${process.cwd()}/node_modules/${arg}`;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('injects lifecycle event hooks into a Gasket instance', async () => {
    const dynamicHook = jest.fn();
    const engine = new PluginEngine({
      plugins: {
        add: [
          {
            name: 'injector',
            hooks: {
              init(gasket) {
                gasket.hook({ event: 'foo', handler: dynamicHook });
              }
            }
          }
        ]
      }
    });
    await engine.exec('init');

    await engine.exec('foo');

    expect(dynamicHook).toHaveBeenCalled();
  });

  it('clears cached execution plans', async () => {
    const dynamicHook = jest.fn();
    const engine = new PluginEngine({
      plugins: {
        add: [
          {
            name: 'injector',
            hooks: {
              bar(gasket) {
                gasket.hook({ event: 'foo', handler: dynamicHook });
              }
            }
          }
        ]
      }
    });

    await engine.exec('foo'); // Execution plan will be cached
    await engine.exec('bar'); // This injects a new `foo` handler

    // Cached execution plan from first invoke shouldn't be used any longer.
    await engine.exec('foo');
    expect(dynamicHook).toHaveBeenCalled();
  });
});
