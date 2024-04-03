const installStub = jest.fn();
const installModules = require('../../../../lib/scaffold/actions/install-modules');

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
    await installModules(mockContext);
    expect(installStub).toHaveBeenCalled();
  });
});
