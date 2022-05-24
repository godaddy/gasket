const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const fs = require('fs');
const path = require('path');
const testConfig = require('./fixtures/docusaurus.config');

const mockDocsConfigSet = { docsRoot: '/path/to/app/.docs' };
const startStub = sinon.stub();
const writeFileStub = sinon
  .stub(fs.promises, 'writeFile')
  .withArgs('/path/to/app/docusaurus.config.js', testConfig)
  .resolves();

const docsView = proxyquire('../lib/docs-view', {
  '@docusaurus/core/lib': {
    start: startStub
  }
});

describe('docsView', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      exec: sinon.stub(),
      metadata: {
        app: {
          name: 'App name'
        }
      },
      config: {
        root: '/path/to/app/'
      }
    };
    sinon.resetHistory();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('reads docusaurus.config.js', () => {
    const readConfigStub = sinon
      .stub(fs.promises, 'readFile')
      .withArgs('/path/to/app/docusaurus.config.js')
      .resolves(testConfig);
    const { root } = mockGasket.config;
    assume(readConfigStub.withArgs(`${root}docusaurus.config.js`).returns(testConfig));
  });

  it('writes docusaurus.config.js if does not exist', () => {
    const readConfigStub = sinon
      .stub(fs.promises, 'readFile')
      .withArgs('/path/to/app/docusaurus.config.js')
      .rejects();
    const { root } = mockGasket.config;
    assume(readConfigStub.withArgs(`${root}docusaurus.config.js`).rejects());
    assume(writeFileStub.withArgs(`${root}docusaurus.config.js`, testConfig).resolves());
  });

  it('merges user config with defaults and starts server', async () => {
    const { root } = mockGasket.config;
    const { docsRoot } = mockDocsConfigSet;
    mockGasket.config.docusaurus = {
      port: 8000,
      host: '0.0.0.0'
    };
    await docsView(mockGasket, mockDocsConfigSet);
    assume(startStub).calledWith(path.join(docsRoot, '..'), {
      port: 8000,
      host: '0.0.0.0',
      config: `${root}docusaurus.config.js`
    });
  });
});
