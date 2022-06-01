const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const path = require('path');
const pluginConfigFile = 'docusaurus.config.js';

describe('docsView', () => {
  let mockGasket, docsView;
  let startStub, writeFileStub, existsStub;

  beforeEach(() => {
    startStub = sinon.stub();
    writeFileStub = sinon.stub();
    existsStub = sinon.stub();

    mockGasket = {
      metadata: {
        app: {
          name: 'App name'
        }
      },
      config: {
        root: '/path/to/app/',
        docusaurus: {
          port: 8000,
          host: '0.0.0.0',
          rootDir: 'some-root',
          docsDir: 'sub-dir'
        }
      }
    };

    docsView = proxyquire('../lib/docs-view', {
      '@docusaurus/core/lib': {
        start: startStub
      },
      'fs': {
        existsSync: existsStub,
        promises: {
          writeFile: writeFileStub
        }
      }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('check if docusaurus.config.js exists', async function () {
    await docsView(mockGasket);
    assume(existsStub).called();
  });

  it('writes docusaurus.config.js if does not exist', async function () {
    existsStub.returns(false);
    await docsView(mockGasket);
    assume(writeFileStub).called();
    assume(writeFileStub)
      .calledWith(path.join(mockGasket.config.root, pluginConfigFile));
  });

  it('does not write docusaurus.config.js if exist', async function () {
    existsStub.returns(true);
    await docsView(mockGasket);
    assume(writeFileStub).not.called();
  });

  it('merges user config with defaults and starts server', async function () {
    const { root, docusaurus } = mockGasket.config;
    await docsView(mockGasket);
    assume(startStub).calledWith(path.join(root, docusaurus.rootDir), {
      ...docusaurus,
      config: path.join(root, pluginConfigFile)
    });
  });
});
