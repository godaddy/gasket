const {
  makePackageIdentifier,
} = require('../lib/package-identifier');

const pluginIdentifier = makePackageIdentifier('gasket');

describe('PackageIdentifier instance', () => {
  let result;

  it('is instance of PackageIdentifier', () => {
    result = pluginIdentifier('example@^1.0.0');
    expect(result.constructor.name).toEqual('PackageIdentifier');
  });

  describe('fullName', () => {

    describe('no scope', () => {
      it('expands short plugin names to full', () => {
        result = pluginIdentifier('example').fullName;
        expect(result).toBe('gasket-plugin-example');
      });

      it('expands one-letter plugin names to full', () => {
        result = pluginIdentifier('p').fullName;
        expect(result).toBe('gasket-plugin-p');
      });

      it('expands multi-word plugin names to full', () => {
        result = pluginIdentifier('another-example').fullName;
        expect(result).toBe('gasket-plugin-another-example');
      });

      it('returns same full plugin names', () => {
        result = pluginIdentifier('gasket-plugin-example').fullName;
        expect(result).toBe('gasket-plugin-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('example@^1.0.0').fullName;
        expect(result).toBe('gasket-plugin-example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('gasket-plugin-example@^1.0.0').fullName;
        expect(result).toBe('gasket-plugin-example');
      });
    });

    describe('user scope', () => {
      it('expands short plugin names to full', () => {
        result = pluginIdentifier('@user/example').fullName;
        expect(result).toBe('@user/gasket-plugin-example');
      });

      it('expands one-letter plugin names to full', () => {
        result = pluginIdentifier('@user/p').fullName;
        expect(result).toBe('@user/gasket-plugin-p');
      });

      it('expands multi-word plugin names to full', () => {
        result = pluginIdentifier('@user/another-example').fullName;
        expect(result).toBe('@user/gasket-plugin-another-example');
      });

      it('returns same full plugin names', () => {
        result = pluginIdentifier('@user/gasket-plugin-example').fullName;
        expect(result).toBe('@user/gasket-plugin-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('@user/example@^1.0.0').fullName;
        expect(result).toBe('@user/gasket-plugin-example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example@^1.0.0').fullName;
        expect(result).toBe('@user/gasket-plugin-example');
      });
    });

    describe('project scope', () => {
      it('expands short plugin names to full', () => {
        result = pluginIdentifier('@gasket/example').fullName;
        expect(result).toBe('@gasket/plugin-example');
      });

      it('expands one-letter plugin names to full', () => {
        result = pluginIdentifier('@gasket/p').fullName;
        expect(result).toBe('@gasket/plugin-p');
      });

      it('expands multi-word plugin names to full', () => {
        result = pluginIdentifier('@gasket/another-example').fullName;
        expect(result).toBe('@gasket/plugin-another-example');
      });

      it('returns same full plugin names', () => {
        result = pluginIdentifier('@gasket/plugin-example').fullName;
        expect(result).toBe('@gasket/plugin-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('@gasket/example@^1.0.0').fullName;
        expect(result).toBe('@gasket/plugin-example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('@gasket/plugin-example@^1.0.0').fullName;
        expect(result).toBe('@gasket/plugin-example');
      });
    });
  });

  describe('shortName', () => {

    describe('no scope', () => {
      it('returns short name if already short name', () => {
        result = pluginIdentifier('example').shortName;
        expect(result).toBe('example');
      });

      it('gets short name if set with full name', () => {
        result = pluginIdentifier('gasket-plugin-example').shortName;
        expect(result).toBe('example');
      });

      it('gets one-letter short name', () => {
        result = pluginIdentifier('gasket-plugin-p').shortName;
        expect(result).toBe('p');
      });

      it('gets multi-word short name', () => {
        result = pluginIdentifier('gasket-plugin-another-example').shortName;
        expect(result).toBe('another-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('example@^1.0.0').shortName;
        expect(result).toBe('example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('gasket-plugin-example@^1.0.0').shortName;
        expect(result).toBe('example');
      });
    });

    describe('user scope', () => {
      it('returns short name if already short name', () => {
        result = pluginIdentifier('@user/example').shortName;
        expect(result).toBe('@user/example');
      });

      it('gets short name if set with full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example').shortName;
        expect(result).toBe('@user/example');
      });

      it('gets one-letter short name', () => {
        result = pluginIdentifier('@user/gasket-plugin-p').shortName;
        expect(result).toBe('@user/p');
      });

      it('gets multi-word short name', () => {
        result = pluginIdentifier('@user/gasket-plugin-another-example').shortName;
        expect(result).toBe('@user/another-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('@user/example@^1.0.0').shortName;
        expect(result).toBe('@user/example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example@^1.0.0').shortName;
        expect(result).toBe('@user/example');
      });
    });

    describe('project scope', () => {
      it('returns short name if already short name', () => {
        result = pluginIdentifier('@gasket/example').shortName;
        expect(result).toBe('@gasket/example');
      });

      it('gets short name if set with full name', () => {
        result = pluginIdentifier('@gasket/plugin-example').shortName;
        expect(result).toBe('@gasket/example');
      });

      it('gets one-letter short name', () => {
        result = pluginIdentifier('@gasket/plugin-p').shortName;
        expect(result).toBe('@gasket/p');
      });

      it('gets multi-word short name', () => {
        result = pluginIdentifier('@gasket/plugin-another-example').shortName;
        expect(result).toBe('@gasket/another-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('@gasket/example@^1.0.0').shortName;
        expect(result).toBe('@gasket/example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('@gasket/plugin-example@^1.0.0').shortName;
        expect(result).toBe('@gasket/example');
      });
    });
  });

  describe('name', () => {

    describe('no scope', () => {
      it('returns short name', () => {
        result = pluginIdentifier('example').name;
        expect(result).toBe('example');
      });

      it('returns full name', () => {
        result = pluginIdentifier('gasket-plugin-example').name;
        expect(result).toBe('gasket-plugin-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('example@^1.0.0').name;
        expect(result).toBe('example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('gasket-plugin-example@^1.0.0').name;
        expect(result).toBe('gasket-plugin-example');
      });
    });

    describe('user scope', () => {
      it('returns short name', () => {
        result = pluginIdentifier('@user/example').name;
        expect(result).toBe('@user/example');
      });

      it('returns full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example').name;
        expect(result).toBe('@user/gasket-plugin-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('@user/example@^1.0.0').name;
        expect(result).toBe('@user/example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example@^1.0.0').name;
        expect(result).toBe('@user/gasket-plugin-example');
      });
    });

    describe('project scope', () => {
      it('returns short name', () => {
        result = pluginIdentifier('@gasket/example').name;
        expect(result).toBe('@gasket/example');
      });

      it('returns full name', () => {
        result = pluginIdentifier('@gasket/plugin-example').name;
        expect(result).toBe('@gasket/plugin-example');
      });

      it('drops version if set with short name', () => {
        result = pluginIdentifier('@gasket/example@^1.0.0').name;
        expect(result).toBe('@gasket/example');
      });

      it('drops version if set with full name', () => {
        result = pluginIdentifier('@gasket/plugin-example@^1.0.0').name;
        expect(result).toBe('@gasket/plugin-example');
      });
    });
  });

  describe('version', () => {

    describe('no scope', () => {
      it('returns version if set with short name', () => {
        result = pluginIdentifier('example@^1.0.0').version;
        expect(result).toBe('^1.0.0');
      });

      it('returns version if set with full name', () => {
        result = pluginIdentifier('gasket-plugin-example@^1.0.0').version;
        expect(result).toBe('^1.0.0');
      });

      it('returns null of no version with short name', () => {
        result = pluginIdentifier('example').version;
        expect(result).toBe(null);
      });

      it('returns null of no version with full name', () => {
        result = pluginIdentifier('gasket-plugin-example').version;
        expect(result).toBe(null);
      });
    });

    describe('user scope', () => {
      it('returns version if set with short name', () => {
        result = pluginIdentifier('@user/example@^1.0.0').version;
        expect(result).toBe('^1.0.0');
      });

      it('returns version if set with full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example@^1.0.0').version;
        expect(result).toBe('^1.0.0');
      });

      it('returns null of no version with short name', () => {
        result = pluginIdentifier('@user/example').version;
        expect(result).toBe(null);
      });

      it('returns null of no version with full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example').version;
        expect(result).toBe(null);
      });
    });

    describe('project scope', () => {
      it('returns version if set with short name', () => {
        result = pluginIdentifier('@gasket/example@^1.0.0').version;
        expect(result).toBe('^1.0.0');
      });

      it('returns version if set with full name', () => {
        result = pluginIdentifier('@gasket/plugin-example@^1.0.0').version;
        expect(result).toBe('^1.0.0');
      });

      it('returns null of no version with short name', () => {
        result = pluginIdentifier('@gasket/example').version;
        expect(result).toBe(null);
      });

      it('returns null of no version with full name', () => {
        result = pluginIdentifier('@gasket/plugin-example').version;
        expect(result).toBe(null);
      });
    });
  });

  describe('full', () => {

    describe('no scope', () => {
      it('expands short plugin names to full', () => {
        result = pluginIdentifier('example').full;
        expect(result).toBe('gasket-plugin-example');
      });

      it('expands one-letter plugin names to full', () => {
        result = pluginIdentifier('p').full;
        expect(result).toBe('gasket-plugin-p');
      });

      it('expands multi-word plugin names to full', () => {
        result = pluginIdentifier('another-example').full;
        expect(result).toBe('gasket-plugin-another-example');
      });

      it('returns same full plugin names', () => {
        result = pluginIdentifier('gasket-plugin-example').full;
        expect(result).toBe('gasket-plugin-example');
      });

      it('includes version if set with short name', () => {
        result = pluginIdentifier('example@^1.0.0').full;
        expect(result).toBe('gasket-plugin-example@^1.0.0');
      });

      it('includes version if set with full name', () => {
        result = pluginIdentifier('gasket-plugin-example@^1.0.0').full;
        expect(result).toBe('gasket-plugin-example@^1.0.0');
      });
    });

    describe('user scope', () => {
      it('expands short plugin names to full', () => {
        result = pluginIdentifier('@user/example').full;
        expect(result).toBe('@user/gasket-plugin-example');
      });

      it('expands one-letter plugin names to full', () => {
        result = pluginIdentifier('@user/p').full;
        expect(result).toBe('@user/gasket-plugin-p');
      });

      it('expands multi-word plugin names to full', () => {
        result = pluginIdentifier('@user/another-example').full;
        expect(result).toBe('@user/gasket-plugin-another-example');
      });

      it('returns same full plugin names', () => {
        result = pluginIdentifier('@user/gasket-plugin-example').full;
        expect(result).toBe('@user/gasket-plugin-example');
      });

      it('includes version if set with short name', () => {
        result = pluginIdentifier('@user/example@^1.0.0').full;
        expect(result).toBe('@user/gasket-plugin-example@^1.0.0');
      });

      it('includes version if set with full name', () => {
        result = pluginIdentifier('@user/gasket-plugin-example@^1.0.0').full;
        expect(result).toBe('@user/gasket-plugin-example@^1.0.0');
      });
    });

    describe('project scope', () => {
      it('expands short plugin names to full', () => {
        result = pluginIdentifier('@gasket/example').full;
        expect(result).toBe('@gasket/plugin-example');
      });

      it('expands one-letter plugin names to full', () => {
        result = pluginIdentifier('@gasket/p').full;
        expect(result).toBe('@gasket/plugin-p');
      });

      it('expands multi-word plugin names to full', () => {
        result = pluginIdentifier('@gasket/another-example').full;
        expect(result).toBe('@gasket/plugin-another-example');
      });

      it('returns same full plugin names', () => {
        result = pluginIdentifier('@gasket/plugin-example').full;
        expect(result).toBe('@gasket/plugin-example');
      });

      it('includes version if set with short name', () => {
        result = pluginIdentifier('@gasket/example@^1.0.0').full;
        expect(result).toBe('@gasket/plugin-example@^1.0.0');
      });

      it('includes version if set with full name', () => {
        result = pluginIdentifier('@gasket/plugin-example@^1.0.0').full;
        expect(result).toBe('@gasket/plugin-example@^1.0.0');
      });
    });
  });

  describe('withVersion()', () => {

    it('returns instance of PackageIdentifier', () => {
      result = pluginIdentifier('example@^1.0.0').withVersion();
      expect(result.constructor.name).toEqual('PackageIdentifier');
    });

    it('returns instance of PackageIdentifier for single letter plugins', () => {
      result = pluginIdentifier('j@^1.0.0').withVersion();
      expect(result.constructor.name).toEqual('PackageIdentifier');
    });

    it('retains version if set with short name', () => {
      result = pluginIdentifier('example@^1.0.0').withVersion();
      expect(result.toString()).toBe('example@^1.0.0');
    });

    it('retains version if set with short name using single letter', () => {
      result = pluginIdentifier('j@^1.0.0').withVersion();
      expect(result.toString()).toBe('j@^1.0.0');
    });

    it('retains version if set with full name', () => {
      result = pluginIdentifier('@gasket/plugin-example@^1.0.0').withVersion();
      expect(result.toString()).toBe('@gasket/plugin-example@^1.0.0');
    });

    it('retains version if set with full name using single letter', () => {
      result = pluginIdentifier('@gasket/plugin-p@^1.0.0').withVersion();
      expect(result.toString()).toBe('@gasket/plugin-p@^1.0.0');
    });

    it('retains version if set with user name', () => {
      result = pluginIdentifier('my-custom-plugin-gasket@^1.0.0').withVersion();
      expect(result.toString()).toBe('my-custom-plugin-gasket@^1.0.0');
    });

    it('retains version if set with user name using single letter', () => {
      result = pluginIdentifier('plugin-m@^1.0.0').withVersion();
      expect(result.toString()).toBe('plugin-m@^1.0.0');
    });

    it('adds default version if no version set', () => {
      result = pluginIdentifier('@gasket/plugin-example').withVersion();
      expect(result.toString()).toBe('@gasket/plugin-example@latest');
    });

    it('adds default version if no version set for single letter plugins', () => {
      result = pluginIdentifier('@gasket/plugin-p').withVersion();
      expect(result.toString()).toBe('@gasket/plugin-p@latest');
    });

    it('adds custom default version if no version set', () => {
      result = pluginIdentifier('@gasket/plugin-example').withVersion('2.0.0.beta-1');
      expect(result.toString()).toBe('@gasket/plugin-example@2.0.0.beta-1');
    });

    it('adds custom default version if no version set for single letter plugins', () => {
      result = pluginIdentifier('@gasket/plugin-p').withVersion('2.0.0.beta-1');
      expect(result.toString()).toBe('@gasket/plugin-p@2.0.0.beta-1');
    });
  });

  describe('nextFormat()', () => {

    it('returns null if not short name', () => {
      result = pluginIdentifier('gasket-plugin-example').nextFormat();
      expect(result).toBe(null);
    });

    it('returns new instance if next format available', () => {
      result = pluginIdentifier('example').nextFormat();
      expect(result.constructor.name).toEqual('PackageIdentifier');
    });

    describe('no scope', () => {

      it('returns postfixed if was prefixed', () => {
        result = pluginIdentifier('example');
        expect(result.isPrefixed).toBe(true);

        result = result.nextFormat();
        expect(result.isPostfixed).toBe(true);
      });

      it('returns project scope + prefixed if was postfixed', () => {
        result = pluginIdentifier('example', { prefixed: false });
        expect(result.fullName).toEqual('example-gasket-plugin');

        result = result.nextFormat();
        expect(result.fullName).toEqual('@gasket/plugin-example');
      });
    });

    describe('user scope', () => {

      it('returns postfixed if was prefixed', () => {
        result = pluginIdentifier('@user/example');
        expect(result.isPrefixed).toBe(true);

        result = result.nextFormat();
        expect(result.isPostfixed).toBe(true);
        expect(result.fullName).toEqual('@user/example-gasket-plugin');
      });

      it('returns null if was postfixed', () => {
        result = pluginIdentifier('@user/example', { prefixed: false });
        expect(result.isPostfixed).toBe(true);

        result = result.nextFormat();
        expect(result).toBe(null);
      });
    });

    describe('project scope', () => {

      it('returns postfixed if was prefixed', () => {
        result = pluginIdentifier('@gasket/example');
        expect(result.isPrefixed).toBe(true);

        result = result.nextFormat();
        expect(result.isPostfixed).toBe(true);
        expect(result.fullName).toEqual('@gasket/example-plugin');
      });

      it('returns null if was postfixed', () => {
        result = pluginIdentifier('@gasket/example', { prefixed: false });
        expect(result.isPostfixed).toBe(true);

        result = result.nextFormat();
        expect(result).toBe(null);
      });
    });
  });

  describe('toString', () => {

    it('returns the raw name', () => {
      result = pluginIdentifier('example@^1.0.0').toString();
      expect(result).toBe('example@^1.0.0');
    });

    it('returns the raw name for single letter names', () => {
      result = pluginIdentifier('j@^1.0.0').toString();
      expect(result).toBe('j@^1.0.0');
    });

    it('uses raw name with string concat', () => {
      result = pluginIdentifier('example@^1.0.0') + ' bogus';
      expect(result).toBe('example@^1.0.0 bogus');
      result = 'bogus: '.concat(pluginIdentifier('example@^1.0.0'));
      expect(result).toBe('bogus: example@^1.0.0');
    });
  });
});
