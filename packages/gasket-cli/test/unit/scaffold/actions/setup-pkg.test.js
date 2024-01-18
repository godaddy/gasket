const mockContstructorStub = jest.fn();
class MockPackageManager {
  constructor() { mockContstructorStub(...arguments); }

  info() {
    return { data: '7.8.9-faked' };
  }
}

jest.mock('@gasket/utils', () => ({
  PackageManager: MockPackageManager
}));

const setupPkg = require('../../../../src/scaffold/actions/setup-pkg');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');


describe('setupPkg', () => {
  let mockContext, packageJsonSpy;

  beforeEach(() => {
    packageJsonSpy = jest.spyOn(ConfigBuilder, 'createPackageJson');
    mockContext = {
      appName: 'my-app',
      appDescription: 'my cool app',
      presetInfos: [{
        name: '@gasket/preset-bogus',
        version: '3.2.1',
        rawName: '@gasket/preset-bogus'
      }],
      cliVersionRequired: '^1.2.3'
    };
  });

  afterEach(() => {

  });

  it('is decorated action', async () => {
    expect(setupPkg).toHaveProperty('wrapped');
  });

  it('instantiates PackageJson app name and description', async () => {
    await setupPkg.wrapped(mockContext);
    expect(mockContstructorStub).toHaveBeenCalled();
    expect(mockContstructorStub.mock.calls[0][0].pkg.fields).toHaveProperty('name', mockContext.appName);
    expect(mockContstructorStub.mock.calls[0][0].pkg.fields).toHaveProperty('description', mockContext.appDescription);
  });

  it('instantiates PackageManager with context', async () => {
    await setupPkg.wrapped(mockContext);
    expect(mockContstructorStub).toHaveBeenCalledWith(mockContext);
  });

  it('adds the preset to pkg dependencies', async () => {
    await setupPkg.wrapped(mockContext);
    expect(mockContext.pkg.fields).toHaveProperty('dependencies');
    expect(mockContext.pkg.fields.dependencies).toHaveProperty('@gasket/preset-bogus');
  });

  it('adds the preset version as compatible with package', async () => {
    await setupPkg.wrapped(mockContext);
    expect(mockContext.pkg.fields).toHaveProperty('dependencies');
    expect(mockContext.pkg.fields.dependencies).toHaveProperty('@gasket/preset-bogus', '^3.2.1');
  });

  it('adds the preset version from rawPresets', async () => {
    mockContext.presetInfos[0].rawName = '@gasket/preset-bogus@4.5.6';
    await setupPkg.wrapped(mockContext);
    expect(mockContext.pkg.fields).toHaveProperty('dependencies');
    expect(mockContext.pkg.fields.dependencies).toHaveProperty('@gasket/preset-bogus', '4.5.6');
  });

  it('adds the preset version with presetPath', async () => {
    mockContext.presetInfos[0].rawName = '@gasket/preset-bogus@file:/path/to/preset';
    await setupPkg.wrapped(mockContext);
    expect(mockContext.pkg.fields).toHaveProperty('dependencies');
    expect(mockContext.pkg.fields.dependencies).toHaveProperty('@gasket/preset-bogus', 'file:/path/to/preset');
  });

  it('adds extra plugins to pkg dependencies', async () => {
    mockContext.rawPlugins = ['@gasket/jest@1.2.3', 'gasket-plugin-custom'];
    await setupPkg.wrapped(mockContext);
    expect(mockContext.pkg.fields.dependencies).toHaveProperty('@gasket/plugin-jest', '1.2.3');
    expect(mockContext.pkg.fields.dependencies).toHaveProperty('gasket-plugin-custom', '^7.8.9-faked');
  });

  it('adds pkg to context', async () => {
    expect(mockContext.pkg).toBeUndefined();
    await setupPkg.wrapped(mockContext);
    expect(mockContext.pkg).toBeInstanceOf(ConfigBuilder);
  });

  it('adds pkgManager to context', async () => {
    expect(mockContext.pkgManager).toBeUndefined();
    await setupPkg.wrapped(mockContext);
    expect(mockContext.pkgManager).toBeInstanceOf(MockPackageManager);
  });
});
