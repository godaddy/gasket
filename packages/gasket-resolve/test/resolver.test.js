const Resolver = require('../resolver');

describe('Resolver', () => {
  it('exposes expected methods', () => {
    const resolver = new Resolver();
    expect(resolver.pluginFor).toBeDefined();
    expect(resolver.presetFor).toBeDefined();
    expect(resolver.tryRequire).toBeDefined();
    expect(resolver.resolveShorthandModule).toBeDefined();
  });

  describe('Resolver({ resolveFrom })', () => {
    it('should resolve all plugins correctly', () => {
      const mockA = {};
      const mockB = {};

      jest
        .doMock('/whatever/node_modules/@gasket/a-plugin', () => mockA, { virtual: true })
        .doMock('/whatever/node_modules/@gasket/b-plugin', () => mockB, { virtual: true });

      const resolver = new Resolver({
        resolveFrom: '/whatever/node_modules'
      });

      const actualA = resolver.pluginFor('a');
      const actualB = resolver.pluginFor('b');

      expect(actualA).toBe(mockA);
      expect(actualB).toBe(mockB);
    });

    it('should resolve all presets correctly', () => {
      const mockA = {};
      const mockB = {};

      jest
        .doMock('/whatever/node_modules/@gasket/a-preset', () => mockA, { virtual: true })
        .doMock('/whatever/node_modules/@gasket/b-preset', () => mockB, { virtual: true });

      const resolver = new Resolver({
        resolveFrom: '/whatever/node_modules'
      });

      const actualA = resolver.presetFor('a');
      const actualB = resolver.presetFor('b');

      expect(actualA).toBe(mockA);
      expect(actualB).toBe(mockB);
    });
  });

  describe('.tryRequire', () => {
    it('suppresses errors for MODULE_NOT_FOUND for that module', () => {
      const resolver = new Resolver();
      const required = resolver.tryRequire('whatever-no-exists');
      expect(required).toBeNull();
    });

    it('throws errors for MODULE_NOT_FOUND of other modules', () => {
      jest.doMock('@gasket/whatever', () => {
        return require('something-else-no-exist');
      }, { virtual: true });

      const resolver = new Resolver();
      expect(() => {
        resolver.tryRequire('@gasket/whatever');
      }).toThrowError(/something-else-no-exist/);
    });
  });
});
