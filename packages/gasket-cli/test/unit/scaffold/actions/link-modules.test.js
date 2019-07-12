const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('linkModules', () => {
  let sandbox, mockContext, mockImports, linkModules;
  let linkStub, packageManagerSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    linkStub = sandbox.stub();

    mockImports = {
      '../package-manager': class PackageManager {
        constructor() {
          this.link = linkStub;
        }
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    packageManagerSpy = sandbox.spy(mockImports, '../package-manager');

    linkModules = proxyquire('../../../../src/scaffold/actions/link-modules', mockImports);

    mockContext = {
      appName: 'my-app',
      pkgLinks: ['some-plugin']
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(linkModules).property('wrapped');
  });

  it('does not do linking if no pkgLinks in context', async () => {
    delete mockContext.pkgLinks;
    await linkModules(mockContext);
    assume(packageManagerSpy).not.calledWith(mockContext);
  });

  it('instantiates PackageManager with context', async () => {
    await linkModules(mockContext);
    assume(packageManagerSpy).is.calledWith(mockContext);
  });

  it('executes link with pkgLinks from context', async () => {
    await linkModules(mockContext);
    assume(linkStub).is.called();
    assume(linkStub.args[0][0]).eqls(mockContext.pkgLinks);
  });
});
