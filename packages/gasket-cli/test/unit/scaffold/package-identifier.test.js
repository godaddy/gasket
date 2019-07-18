const assume = require('assume');

const {
  pluginIdentifier,
  presetIdentifier,
  PackageIdentifier
} = require('../../../src/scaffold/package-identifier');

describe('pluginIdentifier', () => {
  let result;

  it('is instance of PackageIdentifier', () => {
    result = pluginIdentifier('jest@^1.0.0');
    assume(result instanceof PackageIdentifier).equals(true);
  });

  describe('fullName', () => {

    it('expands short plugin names to full', () => {
      result = pluginIdentifier('jest').fullName;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('ignores full @gasket plugin names', () => {
      result = pluginIdentifier('@gasket/jest-plugin').fullName;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('ignores full user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').fullName;
      assume(result).equals('my-custom-gasket-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').fullName;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').fullName;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').fullName;
      assume(result).equals('my-custom-gasket-plugin');
    });

    it('@gasket scoped desc requires -plugin suffix', () => {
      try {
        pluginIdentifier('@gasket/jest');
      } catch (e) {
        assume(e.message).includes("Package descriptions with @gasket scope require suffix '-plugin'");
      }
    });
  });

  describe('shortName', () => {

    it('gets short name if already short name', () => {
      result = pluginIdentifier('jest').shortName;
      assume(result).equals('jest');
    });

    it('gets short name if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin').shortName;
      assume(result).equals('jest');
    });

    it('gets user name if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').shortName;
      assume(result).equals('my-custom-gasket-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').shortName;
      assume(result).equals('jest');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').shortName;
      assume(result).equals('jest');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').shortName;
      assume(result).equals('my-custom-gasket-plugin');
    });
  });

  describe('name', () => {

    it('returns short plugin name', () => {
      result = pluginIdentifier('jest').name;
      assume(result).equals('jest');
    });

    it('returns full plugin name', () => {
      result = pluginIdentifier('@gasket/jest-plugin').name;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('ignores user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').name;
      assume(result).equals('my-custom-gasket-plugin');
    });

    it('drops version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').name;
      assume(result).equals('jest');
    });

    it('drops version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').name;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('drops version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').name;
      assume(result).equals('my-custom-gasket-plugin');
    });
  });

  describe('version', () => {

    it('gets version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').version;
      assume(result).equals('^1.0.0');
    });

    it('gets version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').version;
      assume(result).equals('^1.0.0');
    });

    it('gets version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').version;
      assume(result).equals('^1.0.0');
    });

    it('returns null if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').version;
      assume(result).equals(null);
    });
  });

  describe('full', () => {

    it('expands short plugin names to full', () => {
      result = pluginIdentifier('jest').full;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('ignores full @gasket plugin names', () => {
      result = pluginIdentifier('@gasket/jest-plugin').full;
      assume(result).equals('@gasket/jest-plugin');
    });

    it('ignores full user plugin names', () => {
      result = pluginIdentifier('my-custom-gasket-plugin').full;
      assume(result).equals('my-custom-gasket-plugin');
    });

    it('includes version with full name if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').full;
      assume(result).equals('@gasket/jest-plugin@^1.0.0');
    });

    it('includes version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').full;
      assume(result).equals('@gasket/jest-plugin@^1.0.0');
    });

    it('includes version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').full;
      assume(result).equals('my-custom-gasket-plugin@^1.0.0');
    });
  });

  describe('withVersion', () => {

    it('returns instance of PackageIdentifier', () => {
      result = pluginIdentifier('jest@^1.0.0').withVersion();
      assume(result instanceof PackageIdentifier).equals(true);
    });

    it('retains version if set with short name', () => {
      result = pluginIdentifier('jest@^1.0.0').withVersion();
      assume(result.toString()).equals('jest@^1.0.0');
    });

    it('retains version if set with full name', () => {
      result = pluginIdentifier('@gasket/jest-plugin@^1.0.0').withVersion();
      assume(result.toString()).equals('@gasket/jest-plugin@^1.0.0');
    });

    it('retains version if set with user name', () => {
      result = pluginIdentifier('my-custom-gasket-plugin@^1.0.0').withVersion();
      assume(result.toString()).equals('my-custom-gasket-plugin@^1.0.0');
    });

    it('adds default version if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').withVersion();
      assume(result.toString()).equals('@gasket/jest-plugin@latest');
    });

    it('adds custom default version if no version set', () => {
      result = pluginIdentifier('@gasket/jest-plugin').withVersion('2.0.0.beta-1');
      assume(result.toString()).equals('@gasket/jest-plugin@2.0.0.beta-1');
    });
  });

  describe('toString', () => {

    it('returns the plugin name', () => {
      result = pluginIdentifier('jest@^1.0.0').toString();
      assume(result).equals('jest@^1.0.0');
    });

    it('uses plugin name with string concat', () => {
      result = pluginIdentifier('jest@^1.0.0') + ' bogus';
      assume(result).equals('jest@^1.0.0 bogus');
      result = 'bogus: '.concat(pluginIdentifier('jest@^1.0.0'));
      assume(result).equals('bogus: jest@^1.0.0');
    });
  });
});

describe('presetIdentifier', () => {
  let result;

  it('is instance of PackageIdentifier', () => {
    result = presetIdentifier('default@^1.0.0');
    assume(result instanceof PackageIdentifier).equals(true);
  });

  it('gets short preset name', () => {
    result = presetIdentifier('@gasket/default-preset').shortName;
    assume(result).equals('default');
  });

  it('expands short preset names to full', () => {
    result = presetIdentifier('default').full;
    assume(result).equals('@gasket/default-preset');
  });

  it('plugin is not a valid suffix for presets (becomes expanded)', () => {
    result = presetIdentifier('some-plugin').full;
    assume(result).equals('@gasket/some-plugin-preset');
  });

  it('@gasket scoped desc requires -preset suffix', () => {
    try {
      presetIdentifier('@gasket/default');
    } catch (e) {
      assume(e.message).includes("Package descriptions with @gasket scope require suffix '-preset'");
    }
  });
});
