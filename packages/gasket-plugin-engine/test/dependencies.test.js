describe('The PluginEngine constructor', () => {
  it('throws an Error if a required dependency of a plugin is missing', () => {
    const pluginA = {
      dependencies: ['b', 'c'],
      hooks: {}
    };

    const pluginB = {
      hooks: {}
    };

    const pluginC = {
      hooks: {}
    };

    jest
      .doMock('@gasket/a-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/b-plugin', () => pluginB, { virtual: true })
      .doMock('@gasket/c-plugin', () => pluginC, { virtual: true });

    const PluginEngine = require('..');
    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });

    expect(() => new PluginEngine({ plugins: { add: ['a', 'b'] } })).toThrow(Error);
  });
});
