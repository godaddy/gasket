/* eslint-disable max-statements */

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

describe('Plugin configuration', () => {
  let PluginEngine;
  let defaultPreset;
  let customPreset;
  let pluginA;
  let pluginB;
  let pluginC;
  let pluginStub;

  beforeEach(() => {
    pluginA = { name: 'a', hooks: { mockEvent: jest.fn() } };
    pluginB = { name: 'b', hooks: { mockEvent: jest.fn() } };
    pluginC = { name: 'c', hooks: { mockEvent: jest.fn() } };

    defaultPreset = createPreset({
      name: '@gasket/default-preset',
      plugins: [pluginA, pluginB, pluginC]
    });

    customPreset = createPreset({
      name: '@gasket/custom-preset',
      plugins: [pluginA, pluginC]
    });

    pluginStub = {};

    jest
      .doMock('@gasket/default-preset', () => defaultPreset, { virtual: true })
      .doMock('@gasket/custom-preset', () => customPreset, { virtual: true })
      .doMock('@gasket/a-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/b-plugin', () => pluginB, { virtual: true })
      .doMock('@gasket/c-plugin', () => pluginC, { virtual: true })
      .doMock('@gasket/stub-plugin', () => pluginStub, { virtual: true })
      .doMock('@gasket/eslint-plugin', () => pluginStub, { virtual: true })
      .doMock('eslint', () => ({
        get hooks() {
          throw new Error('Imported wrong module');
        }
      }), { virtual: true });

    PluginEngine = require('..');

    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('uses a default preset with an empty gasket config', async () => {
    await verify({
      withOverallConfig: null,
      expectPlugins: [pluginA, pluginB, pluginC]
    });
  });

  it('uses a default preset with an empty plugin config', async () => {
    await verify({
      withOverallConfig: {
        plugins: null,
        otherConfig: { blah: 'blah' }
      },
      expectPlugins: [pluginA, pluginB, pluginC]
    });
  });

  it('allows custom presets', async () => {
    await verify({
      withConfig: { presets: ['custom'] },
      expectPlugins: [pluginA, pluginC],
      andNotPlugins: [pluginB]
    });
  });

  it('allows adding plugins', async () => {
    await verify({
      withConfig: {
        add: ['b']
      },
      expectPlugins: [pluginB],
      andNotPlugins: [pluginA, pluginC]
    });
  });

  it('allows removing plugins', async () => {
    await verify({
      withConfig: {
        presets: ['default'],
        remove: ['a']
      },
      expectPlugins: [pluginB, pluginC],
      andNotPlugins: [pluginA]
    });
  });

  it('throws an exception if a specified preset is not found', () => {
    expect(() => new PluginEngine({
      plugins: { presets: ['fake'] }
    })).toThrow(Error);
  });

  it('throws an exception if a specified plugin is not found', () => {
    expect(() => new PluginEngine({ plugins: { add: ['d'] } })).toThrow(Error);
  });

  it('handles plugin stubs with no hooks gracefully', () => {
    expect(() => new PluginEngine({ plugins: { add: ['stub'] } }))
      .not.toThrow(Error);
  });

  it('does not import modules matching shorthand plugin names', () => {
    expect(() => new PluginEngine({ plugins: { add: ['eslint'] } }))
      .not.toThrow(Error);
  });

  it('allows plugins to be passed in directly', async () => {
    const plugins = [pluginB, pluginC];
    await verify({
      withConfig: {
        add: plugins
      },
      expectPlugins: plugins,
      andNotPlugins: [pluginA]
    });
  });

  async function verify({
    withOverallConfig,
    withConfig,
    expectPlugins,
    andNotPlugins
  }) {
    const engine = new PluginEngine(
      withOverallConfig === undefined
        ? { plugins: withConfig }
        : withOverallConfig);

    expect(engine).toBeDefined();

    await engine.exec('mockEvent');

    expectPlugins.forEach(plugin => {
      expect(plugin.hooks.mockEvent).toHaveBeenCalled();
    });
    (andNotPlugins || []).forEach(plugin => {
      expect(plugin.hooks.mockEvent).not.toHaveBeenCalled();
    });
  }
});
