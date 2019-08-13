const {
  pluginIdentifier,
  presetIdentifier,
  PackageIdentifier
} = require('../package-identifier');

describe('pluginIdentifier', () => {
  let result;

  it('is instance of PackageIdentifier', () => {
    result = pluginIdentifier('jest@^1.0.0');
    expect(result instanceof PackageIdentifier).toBe(true);
  });

  describe('fullName', () => {

    it('expands short plugin names to full', () => {
      result = pluginIdentifier('jest').fullName;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('ignores full @gasket plugin names', () => {
      result = pluginIdentifier('@gasket/jest-plugin').fullName;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('ignores full user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').fullName;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').fullName;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').fullName;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').fullName;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('@gasket scoped desc requires -plugin suffix', () => {
      try {
        pluginIdentifier('@gasket/jest');
      } catch (e) {
        expect(e.message).toEqual(expect.stringContaining("Package descriptions with @gasket scope require suffix '-plugin'"));
      }
    });
  });

  describe('shortName', () => {

    it('gets short name if already short name', () => {
      result = pluginIdentifier('jest').shortName;
      expect(result).toBe('jest');
    });

    it('gets short name if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin').shortName;
      expect(result).toBe('jest');
    });

    it('gets user name if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').shortName;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').shortName;
      expect(result).toBe('jest');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').shortName;
      expect(result).toBe('jest');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').shortName;
      expect(result).toBe('my-custom-gasket-plugin');
    });
  });

  describe('name', () => {

    it('returns short plugin name', () => {
      result = pluginIdentifier('jest').name;
      expect(result).toBe('jest');
    });

    it('returns full plugin name', () => {
      result = pluginIdentifier('@gasket/jest-plugin').name;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('ignores user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').name;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').name;
      expect(result).toBe('jest');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').name;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').name;
      expect(result).toBe('my-custom-gasket-plugin');
    });
  });

  describe('version', () => {

    it('gets version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('gets version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('gets version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('returns null if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').version;
      expect(result).toBe(null);
    });
  });

  describe('full', () => {

    it('expands short plugin names to full', () => {
      result = pluginIdentifier('jest').full;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('ignores full @gasket plugin names', () => {
      result = pluginIdentifier('@gasket/jest-plugin').full;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('ignores full user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').full;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('includes version with full name if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').full;
      expect(result).toBe('@gasket/jest-plugin@^1.0.0');
    });

    it('includes version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').full;
      expect(result).toBe('@gasket/jest-plugin@^1.0.0');
    });

    it('includes version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').full;
      expect(result).toBe('my-custom-gasket-plugin@^1.0.0');
    });
  });

  describe('withVersion', () => {

    it('returns instance of PackageIdentifier', () => {
      result = pluginIdentifier('jest@^1.0.0').withVersion();
      expect(result instanceof PackageIdentifier).toBe(true);
    });

    it('retains version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').withVersion();
      expect(result.toString()).toBe('jest@^1.0.0');
    });

    it('retains version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').withVersion();
      expect(result.toString()).toBe('@gasket/jest-plugin@^1.0.0');
    });

    it('retains version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').withVersion();
      expect(result.toString()).toBe('my-custom-gasket-plugin@^1.0.0');
    });

    it('adds default version if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').withVersion();
      expect(result.toString()).toBe('@gasket/jest-plugin@latest');
    });

    it('adds custom default version if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').withVersion('2.0.0.beta-1');
      expect(result.toString()).toBe('@gasket/jest-plugin@2.0.0.beta-1');
    });
  });

  describe('toString', () => {

    it('returns the plugin name', () => {
      result = pluginIdentifier('jest@^1.0.0').toString();
      expect(result).toBe('jest@^1.0.0');
    });

    it('uses plugin name with string concat', () => {
      result = pluginIdentifier('jest@^1.0.0') + ' bogus';
      expect(result).toBe('jest@^1.0.0 bogus');
      result = 'bogus: '.concat(pluginIdentifier('jest@^1.0.0'));
      expect(result).toBe('bogus: jest@^1.0.0');
    });
  });
});

describe('presetIdentifier', () => {
  let result;

  it('is instance of PackageIdentifier', () => {
    result = presetIdentifier('default@^1.0.0');
    expect(result instanceof PackageIdentifier).toBe(true);
  });

  it('gets short preset name', () => {
    result = presetIdentifier('@gasket/default-preset').shortName;
    expect(result).toBe('default');
  });

  it('expands short preset names to full', () => {
    result = presetIdentifier('default').full;
    expect(result).toBe('@gasket/default-preset');
  });

  it('plugin is not a valid suffix for presets (becomes expanded)', () => {
    result = presetIdentifier('some-plugin').full;
    expect(result).toBe('@gasket/some-plugin-preset');
  });

  it('@gasket scoped desc requires -preset suffix', () => {
    try {
      presetIdentifier('@gasket/default');
    } catch (e) {
      expect(e.message).toEqual(expect.stringContaining("Package descriptions with @gasket scope require suffix '-preset'"));
    }
  });
});
