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

  describe('tryResolvePresetRelativePath', () => {
    it('resolves the relative path of a gasket preset name', () => {
      const resolver = new Resolver({ root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/root/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePresetRelativePath('presetA', '/root/');
      expect(result).toBe('node_modules/@gasket/presetA-preset');
    });

    it('resolves the relative path of a full gasket preset name', () => {
      const resolver = new Resolver({ root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/root/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePresetRelativePath('@gasket/presetA-preset');
      expect(result).toBe('node_modules/@gasket/presetA-preset');
    });

    it('resolves the relative path of a custom preset name', () => {
      const resolver = new Resolver({ root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/root/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePresetRelativePath('some-custom-preset');
      expect(result).toBe('node_modules/some-custom-preset');
    });

    it('resolves the relative path of a gasket preset name using `resolveFrom`', () => {
      const resolver = new Resolver({ resolveFrom: '/some/resolveFrom/path/', root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/some/resolveFrom/path/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePresetRelativePath('presetA');
      expect(result).toBe('node_modules/@gasket/presetA-preset');
    });

    it('resolves the relative path of a full gasket preset name using `resolveFrom`', () => {
      const resolver = new Resolver({ resolveFrom: '/some/resolveFrom/path/', root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/some/resolveFrom/path/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePresetRelativePath('@gasket/presetA-preset');
      expect(result).toBe('node_modules/@gasket/presetA-preset');
    });

    it('resolves the relative path of a custom preset name using `resolveFrom`', () => {
      const resolver = new Resolver({ resolveFrom: '/some/resolveFrom/path/', root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/some/resolveFrom/path/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePresetRelativePath('some-custom-preset');
      expect(result).toBe('node_modules/some-custom-preset');
    });
  });

  describe('.tryResolvePluginRelativePath', () => {
    it('resolves the relative path of a local plugin', () => {
      const resolver = new Resolver({ root: '/root/' });
      const result = resolver.tryResolvePluginRelativePath('/root/plugin/some-plugin');
      expect(result).toBe('plugin/some-plugin');
    });

    it('resolves the relative path of a gasket plugin name', () => {
      const resolver = new Resolver({ root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/root/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePluginRelativePath('pluginA');
      expect(result).toBe('node_modules/@gasket/pluginA-plugin');
    });

    it('resolves the relative path of a full gasket plugin name', () => {
      const resolver = new Resolver({ root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/root/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePluginRelativePath('@gasket/pluginA-plugin');
      expect(result).toBe('node_modules/@gasket/pluginA-plugin');
    });

    it('resolves the relative path of a custom plugin name', () => {
      const resolver = new Resolver({ root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/root/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePluginRelativePath('some-custom-plugin');
      expect(result).toBe('node_modules/some-custom-plugin');
    });

    it('resolves the relative path of a gasket plugin name using `resolveFrom`', () => {
      const resolver = new Resolver({ resolveFrom: '/some/resolveFrom/path/', root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/some/resolveFrom/path/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePluginRelativePath('pluginA');
      expect(result).toBe('node_modules/@gasket/pluginA-plugin');
    });

    it('resolves the relative path of a full gasket plugin name using `resolveFrom`', () => {
      const resolver = new Resolver({ resolveFrom: '/some/resolveFrom/path/', root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/some/resolveFrom/path/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePluginRelativePath('@gasket/pluginA-plugin');
      expect(result).toBe('node_modules/@gasket/pluginA-plugin');
    });

    it('resolves the relative path of a custom plugin name using `resolveFrom`', () => {
      const resolver = new Resolver({ resolveFrom: '/some/resolveFrom/path/', root: '/root/' });
      jest.spyOn(resolver, 'tryResolve').mockImplementation(arg => {
        return `/some/resolveFrom/path/node_modules/${arg}`;
      });

      const result = resolver.tryResolvePluginRelativePath('some-custom-plugin');
      expect(result).toBe('node_modules/some-custom-plugin');
    });
  });
});
