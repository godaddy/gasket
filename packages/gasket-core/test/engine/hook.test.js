import { Gasket } from '../../lib/gasket.js';

describe('The hook method', () => {
  let gasket, dynamicHook;

  beforeEach(() => {
    dynamicHook = jest.fn();

    const pluginA =
      {
        name: 'pluginA',
        hooks: {
          another(gasket) {
            gasket.hook({ event: 'foo', handler: dynamicHook });
          }
        }
      };

    gasket = new Gasket({ plugins: [pluginA] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('injects lifecycle event hooks into a Gasket instance', async () => {
    await gasket.exec('another');

    await gasket.exec('foo');

    expect(dynamicHook).toHaveBeenCalled();
  });

  it('clears cached execution plans', async () => {
    await gasket.exec('foo'); // Execution plan will be cached
    expect(dynamicHook).not.toHaveBeenCalled();

    await gasket.exec('another'); // This injects a new `foo` handler

    // Cached execution plan from first invoke shouldn't be used any longer.
    await gasket.exec('foo');
    expect(dynamicHook).toHaveBeenCalled();
  });
});
