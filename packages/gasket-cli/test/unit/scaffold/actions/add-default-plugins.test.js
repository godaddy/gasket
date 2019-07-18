const assume = require('assume');
const setupPkg = require('../../../../src/scaffold/actions/setup-pkg');
const proxyquire = require('proxyquire');

describe('Add default plugins', function () {
  let mockContext, addDefaultPlugins;

  beforeEach(async function  () {
    addDefaultPlugins = proxyquire('../../../../src/scaffold/actions/add-default-plugins', { '../default-plugins': ['@gasket/foo-plugin', '@gasket/bar-plugin'] });

    mockContext = {
      appName: 'my-app',
      appDescription: 'my cool app',
      rawPresets: ['@gasket/bogus-preset'],
      presetPkgs: [{
        name: '@gasket/bogus-preset',
        version: '3.2.1'
      }]
    };

    await setupPkg(mockContext);
  });

  it('Adds plugins to package json', function () {
    addDefaultPlugins(mockContext);

    assume(mockContext.pkg.fields.dependencies).property('@gasket/foo-plugin');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bar-plugin');
  });

  it('Adds plugins to context', function () {
    addDefaultPlugins(mockContext);

    assume(mockContext.rawPlugins).contains('@gasket/foo-plugin');
    assume(mockContext.rawPlugins).contains('@gasket/bar-plugin');

    assume(mockContext.plugins).contains('foo');
    assume(mockContext.plugins).contains('bar');
  });
});
