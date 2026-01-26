
const mockContstructorStub = vi.fn();
class MockPackageManager {
  constructor() { mockContstructorStub(...arguments); }

  info() {
    return { data: '7.8.9-faked' };
  }
}

vi.mock('@gasket/utils', () => ({
  PackageManager: MockPackageManager
}));

const setupPkg = (await import('../../../../lib/scaffold/actions/setup-pkg.js')).default;
const { ConfigBuilder } = await import('../../../../lib/scaffold/config-builder');


describe('setupPkg', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'my-app',
      appDescription: 'my cool app',
      template: '@gasket/template-test',
      cliVersionRequired: '^1.2.3'
    };
  });

  afterEach(() => {

  });

  it('is decorated action', async () => {
    expect(setupPkg).toHaveProperty('wrapped');
  });

  it('instantiates PackageJson app name and description', async () => {
    await setupPkg.wrapped({ context: mockContext });
    expect(mockContstructorStub).toHaveBeenCalled();
    expect(mockContstructorStub.mock.calls[0][0].pkg.fields).toHaveProperty('name', mockContext.appName);
    expect(mockContstructorStub.mock.calls[0][0].pkg.fields).toHaveProperty('description', mockContext.appDescription);
  });

  it('instantiates PackageManager with context', async () => {
    await setupPkg.wrapped({ context: mockContext });
    expect(mockContstructorStub).toHaveBeenCalledWith(mockContext);
  });

  it('adds pkg to context', async () => {
    expect(mockContext.pkg).toBeUndefined();
    await setupPkg.wrapped({ context: mockContext });
    expect(mockContext.pkg).toBeInstanceOf(ConfigBuilder);
  });

  it('adds pkgManager to context', async () => {
    expect(mockContext.pkgManager).toBeUndefined();
    await setupPkg.wrapped({ context: mockContext });
    expect(mockContext.pkgManager).toBeInstanceOf(MockPackageManager);
  });
});
