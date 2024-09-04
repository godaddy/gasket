import { Gasket } from '../../lib/gasket.js';

describe('The hook method', () => {
  let mockGasket, dynamicHook;

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

    mockGasket = new Gasket({ plugins: [pluginA] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('injects lifecycle event hooks into a Gasket instance', async () => {
    await mockGasket.exec('another');

    await mockGasket.exec('foo');

    expect(dynamicHook).toHaveBeenCalled();
  });

  it('clears cached execution plans', async () => {
    await mockGasket.exec('foo'); // Execution plan will be cached
    expect(dynamicHook).not.toHaveBeenCalled();

    await mockGasket.exec('another'); // This injects a new `foo` handler

    // Cached execution plan from first invoke shouldn't be used any longer.
    await mockGasket.exec('foo');
    expect(dynamicHook).toHaveBeenCalled();
  });
});
