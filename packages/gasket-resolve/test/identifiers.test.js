const {
  pluginIdentifier,
  presetIdentifier
} = require('../lib/indentifiers');

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
