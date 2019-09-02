describe('Plugin dependencies', () => {
  it('throws an Error if a required dependency of a plugin is missing', () => {
    const pluginA = {
      name: 'pluginA',
      dependencies: ['testb', 'testc'],
      hooks: {}
    };

    const pluginB = {
      name: 'pluginB',
      hooks: {}
    };

    const { Loader } = require('@gasket/resolve');
    jest.spyOn(Loader.prototype, 'loadConfigured').mockImplementation(() => {
      return {
        plugins: [
          { module: pluginA },
          { module: pluginB }
        ]
      };
    });

    const PluginEngine = require('..');
    expect(() => new PluginEngine({})).toThrow(Error);
  });
});
