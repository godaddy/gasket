const PluginEngine = require('..');

const projectPlugin = {
  name: '@gasket/plugin-one',
  hooks: {}
};

describe('Plugin dependencies', () => {
  let mockPlugin;

  beforeEach(() => {
    mockPlugin = {
      name: 'gasket-mock-plugin',
      dependencies: [],
      hooks: {}
    };
  });

  function withPlugins(plugins) {
    return new PluginEngine(plugins);
  }

  it('validates dependencies are loaded', () => {
    mockPlugin.dependencies.push('@gasket/plugin-one');
    expect(() => withPlugins([mockPlugin, projectPlugin])).not.toThrow(Error);
  });


  it('throws an Error if a required dependency of a plugin is missing', () => {
    mockPlugin.dependencies.push('missing');
    expect(() => withPlugins([mockPlugin])).toThrow(Error);
  });
});
