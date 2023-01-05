const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mockDocsConfigSet = { docsRoot: '/path/to/app/.docs' };
const generateContentStub = sinon.stub();
const serveStub = sinon.stub();

const docsView = proxyquire('../lib/docs-view', {
  './generate-content': generateContentStub,
  '@gasket/utils': {
    requireWithInstall: () => ({ serve: serveStub })
  }
});

describe('docsView', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      exec: sinon.stub(),
      config: {}
    };
    sinon.resetHistory();
  });

  it('merges user config with expected defaults', async () => {
    mockGasket.config.docsify = {
      theme: 'bogus',
      config: {
        maxLevel: 4
      }
    };
    await docsView(mockGasket, mockDocsConfigSet);
    const results = generateContentStub.getCall(0).args[0];
    assume(results).eqls({
      theme: 'bogus',
      port: 3000,
      config: {
        nameLink: '#/',
        auto2top: true,
        relativePath: true,
        maxLevel: 4
      }
    });
  });

  it('generates index', async () => {
    await docsView(mockGasket, mockDocsConfigSet);
    assume(generateContentStub).calledWith(sinon.match.object, mockDocsConfigSet);
  });

  it('serves doc root using docsify-cli ', async () => {
    await docsView(mockGasket, mockDocsConfigSet);
    assume(serveStub).calledWith(mockDocsConfigSet.docsRoot, true);
  });
});
