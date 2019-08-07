describe('The PluginEngine constructor', () => {
  it('throws an Error if a required dependency of a plugin is missing', () => {
    const pluginA = {
      dependencies: ['testb', 'testc'],
      hooks: {}
    };

    const pluginB = {
      hooks: {}
    };

    const pluginC = {
      hooks: {}
    };

    jest
      .doMock('@gasket/testa-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/testb-plugin', () => pluginB, { virtual: true })
      .doMock('@gasket/testc-plugin', () => pluginC, { virtual: true });

    const PluginEngine = require('..');
    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });

    expect(() => new PluginEngine({ plugins: { add: ['testa', 'testb'] } })).toThrow(Error);
  });
});
