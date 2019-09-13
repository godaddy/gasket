const {
  pluginIdentifier,
  presetIdentifier,
  PackageIdentifier
} = require('../lib/package-identifier');

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

    it('expands one letter plugin names to full', () => {
      result = pluginIdentifier('p').fullName;
      expect(result).toBe('@gasket/p-plugin');
    });

    it('ignores full @gasket plugin names', () => {
      result = pluginIdentifier('@gasket/jest-plugin').fullName;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('ignores full @gasket plugin names with one letter', () => {
      result = pluginIdentifier('@gasket/a-plugin').fullName;
      expect(result).toBe('@gasket/a-plugin');
    });

    it('ignores full user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').fullName;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('ignores full user plugin names with one letter', () => {
      result = pluginIdentifier('a-plugin').fullName;
      expect(result).toBe('a-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').fullName;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('drops version if set with short name using one letter', () => {
      result = pluginIdentifier('j@^1.0.0').fullName;
      expect(result).toBe('@gasket/j-plugin');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').fullName;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('drops version if set with full name using on eletter', () => {
      result = pluginIdentifier('@gasket/j-plugin@^1.0.0').fullName;
      expect(result).toBe('@gasket/j-plugin');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').fullName;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('drops version if set with user name using one letter plugin', () => {
      result = pluginIdentifier('a-plugin@^1.0.0').fullName;
      expect(result).toBe('a-plugin');
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

    it('gets short name if already short name with single letter name', () => {
      result = pluginIdentifier('j').shortName;
      expect(result).toBe('j');
    });

    it('gets short name if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin').shortName;
      expect(result).toBe('jest');
    });

    it('gets short name if set with full name using single letter name', () => {
      result = pluginIdentifier('@gasket/j-plugin').shortName;
      expect(result).toBe('j');
    });

    it('gets user name if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').shortName;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('gets user name if set with user name using single letter name', () => {
      result = pluginIdentifier('a-plugin').shortName;
      expect(result).toBe('a-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').shortName;
      expect(result).toBe('jest');
    });

    it('drops version if set with short name using single letter name', () => {
      result = pluginIdentifier('j@^1.0.0').shortName;
      expect(result).toBe('j');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').shortName;
      expect(result).toBe('jest');
    });

    it('drops version if set with full name using single letter name', () => {
      result = pluginIdentifier('@gasket/j-plugin@^1.0.0').shortName;
      expect(result).toBe('j');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').shortName;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('drops version if set with user name using single letter name', () => {
      result = pluginIdentifier('a-plugin@^1.0.0').shortName;
      expect(result).toBe('a-plugin');
    });
  });

  describe('name', () => {

    it('returns short plugin name', () => {
      result = pluginIdentifier('jest').name;
      expect(result).toBe('jest');
    });

    it('returns short plugin name with one letter', () => {
      result = pluginIdentifier('j').name;
      expect(result).toBe('j');
    });

    it('returns full plugin name', () => {
      result = pluginIdentifier('@gasket/jest-plugin').name;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('returns full plugin name using one letter', () => {
      result = pluginIdentifier('@gasket/j-plugin').name;
      expect(result).toBe('@gasket/j-plugin');
    });

    it('ignores user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').name;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('ignores user plugin names with one letter', () => {
      result = pluginIdentifier('m').name;
      expect(result).toBe('m');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').name;
      expect(result).toBe('jest');
    });

    it('drops version if set with short name using one letter', () => {
      result = pluginIdentifier('j@^1.0.0').name;
      expect(result).toBe('j');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').name;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('drops version if set with full name with one letter', () => {
      result = pluginIdentifier('@gasket/j-plugin@^1.0.0').name;
      expect(result).toBe('@gasket/j-plugin');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').name;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('drops version if set with user name using one letter', () => {
      result = pluginIdentifier('m-plugin@^1.0.0').name;
      expect(result).toBe('m-plugin');
    });
  });

  describe('version', () => {

    it('gets version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('gets version if set with short name using single letter', () => {
      result = pluginIdentifier('j@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('gets version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('gets version if set with full name using single letter', () => {
      result = pluginIdentifier('@gasket/j-plugin@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('gets version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('gets version if set with user name using single letter', () => {
      result = pluginIdentifier('m-plugin@^1.0.0').version;
      expect(result).toBe('^1.0.0');
    });

    it('returns null if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').version;
      expect(result).toBe(null);
    });

    it('returns null if no version set using single letter', () => {
      result = pluginIdentifier('@gasket/j-plugin').version;
      expect(result).toBe(null);
    });
  });

  describe('full', () => {

    it('expands short plugin names to full', () => {
      result = pluginIdentifier('jest').full;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('expands short plugin names to full with single letter', () => {
      result = pluginIdentifier('j').full;
      expect(result).toBe('@gasket/j-plugin');
    });

    it('ignores full @gasket plugin names', () => {
      result = pluginIdentifier('@gasket/jest-plugin').full;
      expect(result).toBe('@gasket/jest-plugin');
    });

    it('ignores full @gasket plugin names with single letter', () => {
      result = pluginIdentifier('@gasket/j-plugin').full;
      expect(result).toBe('@gasket/j-plugin');
    });

    it('ignores full user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').full;
      expect(result).toBe('my-custom-gasket-plugin');
    });

    it('ignores full user plugin names with single letter', () => {
      result = pluginIdentifier('m-plugin').full;
      expect(result).toBe('m-plugin');
    });

    it('includes version with full name if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').full;
      expect(result).toBe('@gasket/jest-plugin@^1.0.0');
    });

    it('includes version with full name if set with short name using single letter', () => {
      result = pluginIdentifier('j@^1.0.0').full;
      expect(result).toBe('@gasket/j-plugin@^1.0.0');
    });

    it('includes version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').full;
      expect(result).toBe('@gasket/jest-plugin@^1.0.0');
    });

    it('includes version if set with full name using single letter', () => {
      result = pluginIdentifier('@gasket/j-plugin@^1.0.0').full;
      expect(result).toBe('@gasket/j-plugin@^1.0.0');
    });

    it('includes version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').full;
      expect(result).toBe('my-custom-gasket-plugin@^1.0.0');
    });

    it('includes version if set with user name using single letter', () => {
      result = pluginIdentifier('m-plugin@^1.0.0').full;
      expect(result).toBe('m-plugin@^1.0.0');
    });
  });

  describe('withVersion', () => {

    it('returns instance of PackageIdentifier', () => {
      result = pluginIdentifier('jest@^1.0.0').withVersion();
      expect(result instanceof PackageIdentifier).toBe(true);
    });

    it('returns instance of PackageIdentifier for single letter plugins', () => {
      result = pluginIdentifier('j@^1.0.0').withVersion();
      expect(result instanceof PackageIdentifier).toBe(true);
    });

    it('retains version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').withVersion();
      expect(result.toString()).toBe('jest@^1.0.0');
    });

    it('retains version if set with short name using single letter', () => {
      result = pluginIdentifier('j@^1.0.0').withVersion();
      expect(result.toString()).toBe('j@^1.0.0');
    });

    it('retains version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').withVersion();
      expect(result.toString()).toBe('@gasket/jest-plugin@^1.0.0');
    });

    it('retains version if set with full name using single letter', () => {
      result = pluginIdentifier('@gasket/j-plugin@^1.0.0').withVersion();
      expect(result.toString()).toBe('@gasket/j-plugin@^1.0.0');
    });

    it('retains version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').withVersion();
      expect(result.toString()).toBe('my-custom-gasket-plugin@^1.0.0');
    });

    it('retains version if set with user name using single letter', () => {
      result = pluginIdentifier('m-plugin@^1.0.0').withVersion();
      expect(result.toString()).toBe('m-plugin@^1.0.0');
    });

    it('adds default version if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').withVersion();
      expect(result.toString()).toBe('@gasket/jest-plugin@latest');
    });

    it('adds default version if no version set for single letter plugins', () => {
      result = pluginIdentifier('@gasket/j-plugin').withVersion();
      expect(result.toString()).toBe('@gasket/j-plugin@latest');
    });

    it('adds custom default version if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').withVersion('2.0.0.beta-1');
      expect(result.toString()).toBe('@gasket/jest-plugin@2.0.0.beta-1');
    });

    it('adds custom default version if no version set for single letter plugins', () => {
      result = pluginIdentifier('@gasket/j-plugin').withVersion('2.0.0.beta-1');
      expect(result.toString()).toBe('@gasket/j-plugin@2.0.0.beta-1');
    });
  });

  describe('toString', () => {

    it('returns the plugin name', () => {
      result = pluginIdentifier('jest@^1.0.0').toString();
      expect(result).toBe('jest@^1.0.0');
    });

    it('returns the plugin name for single letter names', () => {
      result = pluginIdentifier('j@^1.0.0').toString();
      expect(result).toBe('j@^1.0.0');
    });

    it('uses plugin name with string concat', () => {
      result = pluginIdentifier('jest@^1.0.0') + ' bogus';
      expect(result).toBe('jest@^1.0.0 bogus');
      result = 'bogus: '.concat(pluginIdentifier('jest@^1.0.0'));
      expect(result).toBe('bogus: jest@^1.0.0');
    });
  });

  describe('isValidFullName', () => {

    it('exposes static method', () => {
      expect(pluginIdentifier.isValidFullName).toBeInstanceOf(Function);
    });

    it('true for valid @gasket names', () => {
      result = pluginIdentifier.isValidFullName('@gasket/bogus-plugin');
      expect(result).toBe(true);
    });

    it('true for valid non-@gasket names', () => {
      result = pluginIdentifier.isValidFullName('some-bogus-plugin');
      expect(result).toBe(true);
    });

    it('false for malformed names', () => {
      result = pluginIdentifier.isValidFullName('some-bogus');
      expect(result).toBe(false);
    });
  });
});

describe('presetIdentifier', () => {
  let result;

  it('is instance of PackageIdentifier', () => {
    result = presetIdentifier('nextjs@^1.0.0');
    expect(result instanceof PackageIdentifier).toBe(true);
  });

  it('is instance of PackageIdentifier using single letter preset', () => {
    result = presetIdentifier('d@^1.0.0');
    expect(result instanceof PackageIdentifier).toBe(true);
  });

  it('gets short preset name', () => {
    result = presetIdentifier('@gasket/nextjs-preset').shortName;
    expect(result).toBe('nextjs');
  });

  it('gets short preset name for single letter preset', () => {
    result = presetIdentifier('@gasket/d-preset').shortName;
    expect(result).toBe('d');
  });

  it('expands short preset names to full', () => {
    result = presetIdentifier('nextjs').full;
    expect(result).toBe('@gasket/nextjs-preset');
  });

  it('expands short preset names to full for single letter preset', () => {
    result = presetIdentifier('d').full;
    expect(result).toBe('@gasket/d-preset');
  });

  it('plugin is not a valid suffix for presets (becomes expanded)', () => {
    result = presetIdentifier('some-plugin').full;
    expect(result).toBe('@gasket/some-plugin-preset');
  });

  it('plugin is not a valid suffix for presets (becomes expanded) with single letter presets', () => {
    result = presetIdentifier('s-plugin').full;
    expect(result).toBe('@gasket/s-plugin-preset');
  });

  it('@gasket scoped desc requires -preset suffix', () => {
    try {
      presetIdentifier('@gasket/nextjs');
    } catch (e) {
      expect(e.message).toEqual(expect.stringContaining("Package descriptions with @gasket scope require suffix '-preset'"));
    }
  });

  it('@gasket scoped desc requires -preset suffix for single letter presets', () => {
    try {
      presetIdentifier('@gasket/d');
    } catch (e) {
      expect(e.message).toEqual(expect.stringContaining("Package descriptions with @gasket scope require suffix '-preset'"));
    }
  });

  describe('isValidFullName', () => {

    it('exposes static method', () => {
      expect(presetIdentifier.isValidFullName).toBeInstanceOf(Function);
    });

    it('true for valid @gasket names', () => {
      result = presetIdentifier.isValidFullName('@gasket/bogus-preset');
      expect(result).toBe(true);
    });

    it('true for valid non-@gasket names', () => {
      result = presetIdentifier.isValidFullName('some-bogus-preset');
      expect(result).toBe(true);
    });

    it('false for malformed names', () => {
      result = presetIdentifier.isValidFullName('some-bogus');
      expect(result).toBe(false);
    });
  });
});
