const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');


describe('linkModules', () => {
  let sandbox, mockContext, mockImports, linkModules;
  let linkStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    linkStub = sandbox.stub();

    mockImports = {
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    linkModules = proxyquire('../../../../src/scaffold/actions/link-modules', mockImports);

    mockContext = {
      appName: 'my-app',
      pkgLinks: ['some-plugin'],
      pkgManager: { link: linkStub }
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
    assume(linkStub).not.called();
  });

  it('executes link with pkgLinks from context', async () => {
    await linkModules(mockContext);
    assume(linkStub).is.called();
    assume(linkStub.args[0][0]).eqls(mockContext.pkgLinks);
  });
});
