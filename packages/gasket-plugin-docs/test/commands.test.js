const commands = require('../lib/commands');
const buildDocsConfigSet = require('../lib/utils/build-config-set');
const collateFiles = require('../lib/utils/collate-files');
const generateIndex = require('../lib/utils/generate-index');
const createPackageFile = require('../lib/utils/create-package-file');

const mockGasket = {
  exec: jest.fn(),
  actions: {
    getMetadata: jest.fn(() => ({ app: { name: 'my-app' } }))
  }
};

const mockDocsConfigSet = {
  docsRoot: '/path/to/app/.docs',
  guides: []
};

jest.mock('../lib/utils/build-config-set', () => jest.fn(() => Promise.resolve(mockDocsConfigSet)));
jest.mock('../lib/utils/collate-files');
jest.mock('../lib/utils/generate-index');
jest.mock('../lib/utils/create-package-file');

describe('commands', () => {

  it('returns a command', () => {
    const results = commands(mockGasket);
    expect(results).toBeDefined();
  });

  it('command has id', () => {
    const results = commands(mockGasket);
    expect(results).toHaveProperty('id', 'docs');
  });

  it('command has description', () => {
    const results = commands(mockGasket);
    expect(results).toHaveProperty('description');
  });

  describe('instance', () => {
    const DocsCommand = commands(mockGasket);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('builds docsConfigSet', async () => {
      await DocsCommand.action({ view: true });
      expect(buildDocsConfigSet).toHaveBeenCalledWith(mockGasket);
    });

    it('collates files', async () => {
      await DocsCommand.action({ view: true });
      expect(collateFiles).toHaveBeenCalledWith(mockDocsConfigSet);
    });

    it('generates index', async () => {
      await DocsCommand.action({ view: true });
      expect(generateIndex).toHaveBeenCalledWith(mockDocsConfigSet);
    });

    it('creates package file', async () => {
      await DocsCommand.action({ view: true });
      expect(createPackageFile).toHaveBeenCalledWith(mockDocsConfigSet);
    });

    it('executes docsView lifecycle', async () => {
      await DocsCommand.action({ view: true });
      expect(mockGasket.exec).toHaveBeenCalledWith('docsView', mockDocsConfigSet);
    });

    it('does not execute docsView if --no-view flag', async () => {
      await DocsCommand.action({ view: false });
      expect(mockGasket.exec).toHaveBeenCalledTimes(1);
      expect(mockGasket.exec).toHaveBeenCalledWith('docsGenerate', mockDocsConfigSet);
    });
  });
});
