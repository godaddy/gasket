const { Loader } = require('@gasket/resolve');
const PluginEngine = require('..');

const projectPlugin = {
  name: '@gasket/plugin-one',
  module: {}
};

const userPlugin = {
  name: 'gasket-plugin-two',
  module: {}
};

const userScopedPlugin = {
  name: '@user/gasket-plugin-three',
  module: {}
};

describe('Plugin dependencies', () => {
  let loadConfiguredSpy, mockPlugin;

  const mockConfig = {
    some: 'config'
  };

  beforeEach(() => {
    mockPlugin = {
      name: 'gasket-mock-plugin',
      module: {
        dependencies: []
      }
    };

    loadConfiguredSpy = jest.spyOn(Loader.prototype, 'loadConfigured');
    loadConfiguredSpy.mockImplementation(() => ({ plugins: [mockPlugin] }));
  });

  function withPlugins(plugins) {
    loadConfiguredSpy.mockImplementation(() => ({ plugins: plugins }));
    return new PluginEngine(mockConfig);
  }

  it('validates dependencies are loaded', () => {
    mockPlugin.module.dependencies.push('@gasket/plugin-one');
    expect(() => withPlugins([mockPlugin, projectPlugin])).not.toThrow(Error);
  });


  it('throws an Error if a required dependency of a plugin is missing', () => {
    mockPlugin.module.dependencies.push('missing');
    expect(() => withPlugins([mockPlugin])).toThrow(Error);
  });

  it('validates dependencies using long name form', () => {
    mockPlugin.module.dependencies.push('@gasket/one', 'two', '@user/three');
    expect(() => withPlugins([mockPlugin, projectPlugin, userPlugin, userScopedPlugin])).not.toThrow(Error);
  });
});
