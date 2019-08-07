const Resolver = require('../lib/resolver');

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
        .doMock('/whatever/node_modules/@gasket/testa-plugin', () => mockA, { virtual: true })
        .doMock('/whatever/node_modules/@gasket/testb-plugin', () => mockB, { virtual: true });

      const resolver = new Resolver({
        resolveFrom: '/whatever/node_modules'
      });

      const actualA = resolver.pluginFor('testa');
      const actualB = resolver.pluginFor('testb');

      expect(actualA).toBe(mockA);
      expect(actualB).toBe(mockB);
    });

    it('should resolve all presets correctly', () => {
      const mockA = {};
      const mockB = {};

      jest
        .doMock('/whatever/node_modules/@gasket/testa-preset', () => mockA, { virtual: true })
        .doMock('/whatever/node_modules/@gasket/testb-preset', () => mockB, { virtual: true });

      const resolver = new Resolver({
        resolveFrom: '/whatever/node_modules'
      });

      const actualA = resolver.presetFor('testa');
      const actualB = resolver.presetFor('testb');

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
      }).toThrow(/something-else-no-exist/);
    });
  });
});
