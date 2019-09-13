const sinon = require('sinon');
const assume = require('assume');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');


describe('setupPkg', () => {
  let sandbox, mockContext, setupPkg;
  let packageJsonSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    packageJsonSpy = sandbox.spy(ConfigBuilder, 'createPackageJson');

    setupPkg = require('../../../../src/scaffold/actions/setup-pkg');

    mockContext = {
      appName: 'my-app',
      appDescription: 'my cool app',
      presetInfos: [{
        name: '@gasket/bogus-preset',
        version: '3.2.1',
        rawName: '@gasket/bogus-preset'
      }],
      cliVersionRequired: '^1.2.3'
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(setupPkg).property('wrapped');
  });

  it('instantiates PackageJson app name and description', async () => {
    await setupPkg.wrapped(mockContext);
    assume(packageJsonSpy).is.called();
    assume(packageJsonSpy.args[0][0]).property('name', mockContext.appName);
    assume(packageJsonSpy.args[0][0]).property('description', mockContext.appDescription);
  });

  it('adds the preset to pkg dependencies', async () => {
    await setupPkg.wrapped(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset');
  });

  it('adds the preset version as compatible with package', async () => {
    await setupPkg.wrapped(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset', '^3.2.1');
  });

  it('adds the preset version from rawPresets', async () => {
    mockContext.presetInfos[0].rawName = '@gasket/bogus-preset@4.5.6';
    await setupPkg.wrapped(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset', '4.5.6');
  });

  it('adds the preset version with presetPath', async () => {
    mockContext.presetInfos[0].rawName = '@gasket/bogus-preset@file:/path/to/preset';
    await setupPkg.wrapped(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset', 'file:/path/to/preset');
  });

  it('adds extra plugins to pkg dependencies', async () => {
    mockContext.rawPlugins = ['jest@1.2.3', 'my-custom-gasket-plugin'];
    await setupPkg.wrapped(mockContext);
    assume(mockContext.pkg.fields.dependencies).property('@gasket/jest-plugin', '1.2.3');
    assume(mockContext.pkg.fields.dependencies).property('my-custom-gasket-plugin', 'latest');
  });

  it('adds pkg to context', async () => {
    assume(mockContext.pkg).is.undefined();
    await setupPkg.wrapped(mockContext);
    assume(mockContext.pkg).is.instanceOf(ConfigBuilder);
  });
});
