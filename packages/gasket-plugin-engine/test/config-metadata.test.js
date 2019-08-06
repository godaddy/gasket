
const PluginEngine = require('../lib/engine');

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
    const aPlugin = { name: 'a', hooks: { mockEvent: jest.fn() } };
    const somePreset = createPreset({
      name: '@gasket/somePreset-preset',
      plugins: [aPlugin]
    });

    jest
      .doMock('@gasket/a-plugin', () => aPlugin, { virtual: true })
      .doMock('@gasket/somePreset-preset', () => somePreset, { virtual: true });

    jest.spyOn(PluginEngine.prototype, '_rootPath').mockImplementation(() => {
      return '/root/';
    });

    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('includes the plugin path into gasket.config.metadata.plugins when using a plugin name', async () => {
    const engine = new PluginEngine({
      plugins: {
        add: ['a']
      }
    });

    expect(engine.config.metadata.plugins).toStrictEqual({ a: { modulePath: '/node_modules/@gasket/a-plugin' } });
    expect(engine.config.metadata.presets).toStrictEqual({});
  });

  it('includes the plugin path into gasket.config.metadata.plugins when using a plugin object', async () => {
    const dynamicHook = jest.fn();
    const engine = new PluginEngine({
      plugins: {
        add: [
          {
            name: 'a',
            hooks: {
              init(gasket) {
                gasket.hook({ event: 'foo', handler: dynamicHook });
              }
            }
          }
        ]
      }
    });

    expect(engine.config.metadata.plugins).toStrictEqual({ a: { modulePath: '/node_modules/@gasket/a-plugin' } });
    expect(engine.config.metadata.presets).toStrictEqual({});
  });

  it('does not include the plugin path if it is removed', async () => {
    const engine = new PluginEngine({
      plugins: {
        add: ['a'],
        remove: ['a']
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
        modulePath: '/node_modules/@gasket/somePreset-preset'
      }
    });
    expect(engine.config.metadata.plugins).toStrictEqual({ a: { modulePath: '/node_modules/@gasket/a-plugin' } });
  });

  it('includes the preset path but not the plugins paths into gasket.config.metadata when using a preset', async () => {
    const engine = new PluginEngine({
      plugins: {
        presets: ['somePreset'],
        remove: ['a']
      }
    });

    expect(engine.config.metadata.presets).toStrictEqual({
      somePreset: {
        modulePath: '/node_modules/@gasket/somePreset-preset'
      }
    });
    expect(engine.config.metadata.plugins).toStrictEqual({});
  });
});
