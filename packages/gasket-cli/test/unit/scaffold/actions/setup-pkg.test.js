const sinon = require('sinon');
const assume = require('assume');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');

const pkgVersion = require('../../../../package.json').version;


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
      rawPresets: ['@gasket/bogus-preset'],
      presetPkgs: [{
        name: '@gasket/bogus-preset',
        version: '3.2.1'
      }],
      warnings: []
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(setupPkg).property('wrapped');
  });

  it('instantiates PackageJson app name and description', async () => {
    await setupPkg(mockContext);
    assume(packageJsonSpy).is.called();
    assume(packageJsonSpy.args[0][0]).property('name', mockContext.appName);
    assume(packageJsonSpy.args[0][0]).property('description', mockContext.appDescription);
  });

  it('adds pkg to context', async () => {
    assume(mockContext.pkg).is.undefined();
    await setupPkg(mockContext);
    assume(mockContext.pkg).is.instanceOf(ConfigBuilder);
  });

  it('adds the preset to pkg dependencies', async () => {
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset');
  });

  it('adds the preset version as compatible with package', async () => {
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset', '^3.2.1');
  });

  it('adds the preset version from rawPresets', async () => {
    mockContext.rawPresets = ['@gasket/bogus-preset@4.5.6'];
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset', '4.5.6');
  });

  it('adds the preset version with presetPath', async () => {
    mockContext.rawPresets = ['@gasket/bogus-preset@file:/path/to/preset'];
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields).property('dependencies');
    assume(mockContext.pkg.fields.dependencies).property('@gasket/bogus-preset', 'file:/path/to/preset');
  });

  it('adds extra plugins to pkg dependencies', async () => {
    mockContext.rawPlugins = ['jest@1.2.3', 'my-custom-gasket-plugin'];
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields.dependencies).property('@gasket/jest-plugin', '1.2.3');
    assume(mockContext.pkg.fields.dependencies).property('my-custom-gasket-plugin', 'latest');
  });

  it('derives cli version from own package', async () => {
    assume(mockContext.pkg).is.undefined();
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields.dependencies).property('@gasket/cli', `^${pkgVersion}`);
  });

  it('uses own cli version if not specified in preset', async () => {
    mockContext.presetPkgs = [{
      name: '@gasket/bogus-preset',
      version: '3.2.1',
      dependencies: {}
    }];
    assume(mockContext.pkg).is.undefined();
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields.dependencies).property('@gasket/cli', `^${pkgVersion}`);
  });

  it('derives cli version from preset', async () => {
    mockContext.presetPkgs = [{
      name: '@gasket/bogus-preset',
      version: '3.2.1',
      dependencies: { '@gasket/cli': '^1.2.3' }
    }];
    assume(mockContext.pkg).is.undefined();
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields.dependencies).property('@gasket/cli', `^1.2.3`);
  });

  it('derives minimum cli version from multiple presets', async () => {
    mockContext.presetPkgs = [{
      name: '@gasket/bogus-a-preset',
      version: '1.2.3',
      dependencies: { '@gasket/cli': '^1.3.4' }
    }, {
      name: '@gasket/bogus-b-preset',
      version: '1.2.3',
      dependencies: { '@gasket/cli': '^2.9.9' }
    }, {
      name: '@gasket/bogus-c-preset',
      version: '3.2.1',
      dependencies: { '@gasket/cli': '^1.2.3' }
    }];
    assume(mockContext.pkg).is.undefined();
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields.dependencies).property('@gasket/cli', `^1.2.3`);
  });

  it('issues warning if cli version does not satisfy a preset', async () => {
    mockContext.presetPkgs = [{
      name: '@gasket/bogus-a-preset',
      version: '1.2.3',
      dependencies: { '@gasket/cli': '^1.3.4' }
    }, {
      name: '@gasket/bogus-b-preset',
      version: '1.2.3',
      dependencies: { '@gasket/cli': '^2.9.9' }
    }, {
      name: '@gasket/bogus-c-preset',
      version: '3.2.1',
      dependencies: { '@gasket/cli': '^1.2.3' }
    }];
    assume(mockContext.pkg).is.undefined();
    await setupPkg(mockContext);
    assume(mockContext.warnings).length(1);
    assume(mockContext.warnings).includes(
      'Installed @gasket/cli@^1.2.3 which does not satisfy version (^2.9.9) ' +
      'required by @gasket/bogus-b-preset@1.2.3'
    );
  });

  it('supports file path for preset cli version', async () => {
    mockContext.presetPkgs = [{
      name: '@gasket/bogus-a-preset',
      version: '1.2.3',
      dependencies: { '@gasket/cli': 'file:../../../gasket-cli' }
    }, {
      name: '@gasket/bogus-b-preset',
      version: '1.2.3',
      dependencies: { '@gasket/cli': '^2.9.9' }
    }];
    assume(mockContext.pkg).is.undefined();
    await setupPkg(mockContext);
    assume(mockContext.pkg.fields.dependencies).property('@gasket/cli', `file:../../../gasket-cli`);
  });
});
