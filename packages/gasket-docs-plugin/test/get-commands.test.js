const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

class MockBaseCommand {}
const mockGasket = {
  exec: sinon.stub()
};
const mockData = { BaseCommand: MockBaseCommand };
const mockDocsConfigSet = { docsRoot: '/path/to/app/.docs' };

const buildConfigSetStub = sinon.stub().resolves(mockDocsConfigSet);
const collateFilesStub = sinon.stub();
const generateIndexStub = sinon.stub();

const getCommands = proxyquire('../lib/get-commands', {
  './utils/build-config-set': buildConfigSetStub,
  './utils/collate-files': collateFilesStub,
  './utils/generate-index': generateIndexStub
});

describe('getCommands', () => {

  it('returns a command', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results.prototype).instanceOf(MockBaseCommand);
  });

  it('command has id', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results).property('id', 'docs');
  });

  it('command has description', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results).property('description');
  });

  it('command implements runHooks', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results.prototype).property('runHooks');
  });

  describe('instance', () => {
    const DocsCommand = getCommands(mockGasket, mockData);
    const instance = new DocsCommand();

    beforeEach(() => {
      sinon.resetHistory()
    });

    it('builds docsConfigSet', async () => {
      await instance.runHooks();
      assume(buildConfigSetStub).calledWith(mockGasket);
    });

    it('collates files', async () => {
      await instance.runHooks();
      assume(collateFilesStub).calledWith(mockDocsConfigSet);
    });

    it('generates index', async () => {
      await instance.runHooks();
      assume(generateIndexStub).calledWith(mockDocsConfigSet);
    });

    it('executes docsView lifecycle', async () => {
      await instance.runHooks();
      assume(mockGasket.exec).calledWith('docsView', mockDocsConfigSet);
    });
  });
});
