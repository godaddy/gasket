const installStub = vi.fn();
const installModules = (await import('../../../../lib/scaffold/actions/install-modules.js')).default;

describe('installModules', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'my-app',
      pkgManager: { install: installStub }
    };
  });

  it('is decorated action', async () => {
    expect(installModules).toHaveProperty('wrapped');
  });

  it('executes install', async () => {
    await installModules({ context: mockContext });
    expect(installStub).toHaveBeenCalled();
  });
});
