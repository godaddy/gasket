const {
  pluginIdentifier,
  presetIdentifier
} = require('../lib/identifiers');

describe('pluginIdentifier', () => {
  let result;

  it('returns instance of PackageIdentifier', () => {
    result = pluginIdentifier('example');
    expect(result.constructor.name).toEqual('PackageIdentifier');
  });

  it('is plugin type', () => {
    result = pluginIdentifier('example').fullName;
    expect(result).toContain('plugin');
  });

  it('has gasket project name', () => {
    result = pluginIdentifier('example').fullName;
    expect(result).toContain('gasket');
  });

  it('generates unique names for anonymous plugins', () => {
    const name1 = pluginIdentifier().fullName;
    const name2 = pluginIdentifier().fullName;
    expect(name1).not.toEqual(name2);
  });
});

describe('presetIdentifier', () => {
  let result;

  it('returns instance of PackageIdentifier', () => {
    result = presetIdentifier('example');
    expect(result.constructor.name).toEqual('PackageIdentifier');
  });

  it('is preset type', () => {
    result = presetIdentifier('example').fullName;
    expect(result).toContain('preset');
  });

  it('has gasket project name', () => {
    result = presetIdentifier('example').fullName;
    expect(result).toContain('gasket');
  });
});
