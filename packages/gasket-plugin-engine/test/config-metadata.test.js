
const PluginEngine = require('../lib/engine');
const Resolver = require('../lib/resolver');

/*
 * Simple helper to create the data structure @gasket/resolve
 * generates in presets.
 */
function createPreset({ name: preset, plugins }) {
  return plugins.map(plugin => {
    return {
      required: plugin,
      kind: 'plugin',
      from: preset,
      shortName: plugin.name,
      name: `@gasket/${plugin.name}-plugin`,
      range: 'latest'
    };
  });
}

describe('PluginEngine', () => {

  beforeEach(() => {
    const testAPlugin = { name: 'testa', hooks: { mockEvent: jest.fn() } };
    const customPlugin = { name: 'custom-plugin' };
    const somePreset = createPreset({
      name: '@gasket/somePreset-preset',
      plugins: [testAPlugin]
    });

    jest
      .doMock('@gasket/testa-plugin', () => testAPlugin, { virtual: true })
      .doMock('@gasket/somePreset-preset', () => somePreset, { virtual: true })
      .doMock('@something/custom-plugin', () => customPlugin, { virtual: true });

    jest.spyOn(Resolver.prototype, 'tryResolve').mockImplementation(arg => {
      return `${process.cwd()}/node_modules/${arg}`;
    });
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('includes the plugin path into gasket.config.metadata.plugins when using a plugin name', async () => {
    const engine = new PluginEngine({
      plugins: {
        add: ['testa']
      }
    });

    expect(engine.config.metadata.plugins).toStrictEqual({ testa: { modulePath: 'node_modules/@gasket/testa-plugin' } });
    expect(engine.config.metadata.presets).toStrictEqual({});
  });

  it('includes the plugin path into gasket.config.metadata.plugins when using a custom plugin name', async () => {
    const engine = new PluginEngine({
      plugins: {
        add: ['@something/custom-plugin']
      }
    });

    expect(engine.config.metadata.plugins).toStrictEqual({ '@something/custom-plugin': { modulePath: 'node_modules/@something/custom-plugin' } });
    expect(engine.config.metadata.presets).toStrictEqual({});
  });

  it('includes the plugin path into gasket.config.metadata.plugins when using a plugin object', async () => {
    const dynamicHook = jest.fn();
    const engine = new PluginEngine({
      plugins: {
        add: [
          {
            name: 'testa',
            hooks: {
              init(gasket) {
                gasket.hook({ event: 'foo', handler: dynamicHook });
              }
            }
          }
        ]
      }
    });

    expect(engine.config.metadata.plugins).toStrictEqual({ testa: { modulePath: 'node_modules/@gasket/testa-plugin' } });
    expect(engine.config.metadata.presets).toStrictEqual({});
  });

  it('does not include the plugin path if it is removed', async () => {
    const engine = new PluginEngine({
      plugins: {
        add: ['testa'],
        remove: ['testa']
      }
    });

    expect(engine.config.metadata.plugins).toStrictEqual({});
    expect(engine.config.metadata.presets).toStrictEqual({});
  });

  it('includes the preset path and its plugins paths into gasket.config.metadata when using a preset', async () => {
    const engine = new PluginEngine({
      plugins: {
        presets: ['somePreset']
      }
    });

    expect(engine.config.metadata.presets).toStrictEqual({
      somePreset: {
        modulePath: 'node_modules/@gasket/somePreset-preset'
      }
    });
    expect(engine.config.metadata.plugins).toStrictEqual({ testa: { modulePath: 'node_modules/@gasket/testa-plugin' } });
  });

  it('includes the preset path but not the plugins paths into gasket.config.metadata when using a preset', async () => {
    const engine = new PluginEngine({
      plugins: {
        presets: ['somePreset'],
        remove: ['testa']
      }
    });

    expect(engine.config.metadata.presets).toStrictEqual({
      somePreset: {
        modulePath: 'node_modules/@gasket/somePreset-preset'
      }
    });
    expect(engine.config.metadata.plugins).toStrictEqual({});
  });
});
