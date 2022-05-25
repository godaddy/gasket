const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const fs = require('fs');
const path = require('path');
const mockDocsConfigSet = { docsRoot: '/path/to/app' };
const pluginConfigFile = 'docusaurus.config.js';


describe('docsView', () => {
  let mockGasket, docsView;
  let startStub, writeFileStub, existsStub;

  beforeEach(() => {
    startStub = sinon.stub();
    writeFileStub = sinon.stub(fs.promises, 'writeFile');
    existsStub = sinon.stub(fs, 'existsSync');

    mockGasket = {
      metadata: {
        app: {
          name: 'App name'
        }
      },
      config: {
        root: '/path/to/app/'
      }
    };

    docsView = proxyquire('../lib/docs-view', {
      '@docusaurus/core/lib': {
        start: startStub
      }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('check if docusaurus.config.js exists', async function () {
    await docsView(mockGasket, mockDocsConfigSet);
    assume(existsStub).called();
  });

  it('writes docusaurus.config.js if does not exist', async function () {
    await docsView(mockGasket, mockDocsConfigSet);
    assume(writeFileStub).called();
    assume(writeFileStub)
      .calledWith(path.join(mockDocsConfigSet.docsRoot, pluginConfigFile));
  });

  it('does not write docusaurus.config.js if exist', async function () {
    existsStub.returns(true);
    await docsView(mockGasket, mockDocsConfigSet);
    assume(writeFileStub).not.called();
  });

  it('merges user config with defaults and starts server', async function () {
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
