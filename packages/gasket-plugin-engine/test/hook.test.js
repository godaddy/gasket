const PluginEngine = require('../lib/engine');

describe('The hook method', () => {
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

    expect(dynamicHook).toBeCalled();
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
    expect(dynamicHook).toBeCalled();
  });
});
