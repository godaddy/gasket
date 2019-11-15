const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mockGasket = {
  exec: sinon.stub()
};

class MockGasketCommand {
  constructor() {
    this.gasket = mockGasket;
  }
}

const mockData = { GasketCommand: MockGasketCommand, flags: { boolean: sinon.stub() } };
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
    assume(results.prototype).instanceOf(MockGasketCommand);
  });

  it('command has id', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results).property('id', 'docs');
  });

  it('command has description', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results).property('description');
  });

  it('command implements gasketRun', () => {
    const results = getCommands(mockGasket, mockData);
    assume(results.prototype).property('gasketRun');
  });

  describe('instance', () => {
    const DocsCommand = getCommands(mockGasket, mockData);
    const instance = new DocsCommand();

    beforeEach(() => {
      sinon.resetHistory();
      instance.parsed = { flags: { view: true } };
    });

    it('builds docsConfigSet', async () => {
      await instance.gasketRun();
      assume(buildConfigSetStub).calledWith(mockGasket);
    });

    it('collates files', async () => {
      await instance.gasketRun();
      assume(collateFilesStub).calledWith(mockDocsConfigSet);
    });

    it('generates index', async () => {
      await instance.gasketRun();
      assume(generateIndexStub).calledWith(mockDocsConfigSet);
    });

    it('executes docsView lifecycle', async () => {
      await instance.gasketRun();
      assume(mockGasket.exec).calledWith('docsView', mockDocsConfigSet);
    });

    it('does not execute docsView if --no-view flag', async () => {
      instance.parsed.flags.view = false;
      await instance.gasketRun();
      assume(mockGasket.exec).not.called();
    });
  });
});
