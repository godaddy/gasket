const getCommands = require('../lib/get-commands');
const buildDocsConfigSet = require('../lib/utils/build-config-set');
const collateFiles = require('../lib/utils/collate-files');
const generateIndex = require('../lib/utils/generate-index');

const mockGasket = {
  exec: jest.fn()
};

class MockGasketCommand {
  constructor() {
    this.gasket = mockGasket;
  }
}

const mockData = { GasketCommand: MockGasketCommand, flags: { boolean: jest.fn() } };
const mockDocsConfigSet = {
  docsRoot: '/path/to/app/.docs',
  guides: []
};

jest.mock('../lib/utils/build-config-set', () => jest.fn(() => Promise.resolve(mockDocsConfigSet)));
jest.mock('../lib/utils/collate-files');
jest.mock('../lib/utils/generate-index');

describe('getCommands', () => {

  it('returns a command', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results.prototype).toBeInstanceOf(MockGasketCommand);
  });

  it('command has id', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results).toHaveProperty('id', 'docs');
  });

  it('command has description', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results).toHaveProperty('description');
  });

  it('command implements gasketRun', () => {
    const results = getCommands(mockGasket, mockData);
    expect(results.prototype).toHaveProperty('gasketRun');
  });

  describe('instance', () => {
    const DocsCommand = getCommands(mockGasket, mockData);
    const instance = new DocsCommand();

    beforeEach(() => {
      instance.parsed = { flags: { view: true } };
      jest.clearAllMocks();
    });

    it('builds docsConfigSet', async () => {
      await instance.gasketRun();
      expect(buildDocsConfigSet).toHaveBeenCalledWith(mockGasket);
    });

    it('collates files', async () => {
      await instance.gasketRun();
      expect(collateFiles).toHaveBeenCalledWith(mockDocsConfigSet);
    });

    it('generates index', async () => {
      await instance.gasketRun();
      expect(generateIndex).toHaveBeenCalledWith(mockDocsConfigSet);
    });

    it('executes docsView lifecycle', async () => {
      await instance.gasketRun();
      expect(mockGasket.exec).toHaveBeenCalledWith('docsView', mockDocsConfigSet);
    });

    it('does not execute docsView if --no-view flag', async () => {
      instance.parsed.flags.view = false;
      await instance.gasketRun();
      expect(mockGasket.exec).toHaveBeenCalledTimes(1);
      expect(mockGasket.exec).toHaveBeenCalledWith('docsGenerate', mockDocsConfigSet);
    });
  });
});
