import { GasketEngine } from '../../lib/engine.js';

describe('The hook method', () => {
  let engine, dynamicHook;

  beforeEach(() => {
    dynamicHook = jest.fn();

    const pluginA =
      {
        name: 'pluginA',
        hooks: {
          init(gasket) {
            gasket.hook({ event: 'foo', handler: dynamicHook });
          }
        }
      };

    engine = new GasketEngine([pluginA]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('injects lifecycle event hooks into a Gasket instance', async () => {
    await engine.exec('init');

    await engine.exec('foo');

    expect(dynamicHook).toHaveBeenCalled();
  });

  it('clears cached execution plans', async () => {
    await engine.exec('foo'); // Execution plan will be cached
    expect(dynamicHook).not.toHaveBeenCalled();

    await engine.exec('init'); // This injects a new `foo` handler

    // Cached execution plan from first invoke shouldn't be used any longer.
    await engine.exec('foo');
    expect(dynamicHook).toHaveBeenCalled();
  });
});
