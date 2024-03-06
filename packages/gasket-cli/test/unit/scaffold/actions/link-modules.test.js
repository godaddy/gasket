const linkStub = jest.fn();
const linkModules = require('../../../../src/scaffold/actions/link-modules');

describe('linkModules', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      appName: 'my-app',
      pkgLinks: ['some-plugin'],
      pkgManager: { link: linkStub }
    };
  });

  it('is decorated action', async () => {
    expect(linkModules).toHaveProperty('wrapped');
  });

  it('does not do linking if no pkgLinks in context', async () => {
    delete mockContext.pkgLinks;
    await linkModules(mockContext);
    expect(linkStub).not.toHaveBeenCalled();
  });

  it('executes link with pkgLinks from context', async () => {
    await linkModules(mockContext);
    expect(linkStub).toHaveBeenCalled();
    expect(linkStub.mock.calls[0][0]).toEqual(mockContext.pkgLinks);
  });
});
