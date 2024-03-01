const path = require('path');
const mockStartStub = jest.fn();
const mockWriteFileStub = jest.fn();
const mockExistsStub = jest.fn();
const mockTryRequireStub = jest.fn();

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  return {
    ...mod,
    existsSync: mockExistsStub,
    promises: {
      writeFile: mockWriteFileStub,
      readFile: mod.promises.readFile
    }
  };
});
jest.mock('@docusaurus/core/lib', () => ({
  start: mockStartStub
}));

jest.mock('@gasket/utils', () => ({
  tryRequire: mockTryRequireStub
}));

const pluginConfigFile = 'docusaurus.config.js';
const docsView = require('../lib/docs-view');


describe('docsView', () => {
  let mockGasket;

  beforeEach(() => {
    mockTryRequireStub.mockReturnValue(true);
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
  });

  it('check if docusaurus.config.js exists', async function () {
    await docsView(mockGasket);
    expect(mockExistsStub).toHaveBeenCalled();
  });

  it('writes docusaurus.config.js if does not exist', async function () {
    mockExistsStub.mockReturnValue(false);
    await docsView(mockGasket);
    expect(mockWriteFileStub).toHaveBeenCalled();
    expect(mockWriteFileStub)
      .toHaveBeenCalledWith(path.join(mockGasket.config.root, pluginConfigFile), expect.any(String), 'utf-8');
  });

  it('does not write docusaurus.config.js if exist', async function () {
    mockExistsStub.mockReturnValue(true);
    await docsView(mockGasket);
    expect(mockWriteFileStub)
      .not
      .toHaveBeenCalledWith(path.join(mockGasket.config.root, pluginConfigFile));
  });

  it('merges user config with defaults and starts server', async function () {
    const { root, docusaurus } = mockGasket.config;
    await docsView(mockGasket);
    expect(mockStartStub).toHaveBeenCalledWith(path.join(root, docusaurus.rootDir), {
      ...docusaurus,
      config: path.join(root, pluginConfigFile)
    });
  });

  it('throw on missing devDependencies', async function () {
    mockTryRequireStub.mockReturnValue(false);
    expect(mockTryRequireStub).toHaveBeenCalledWith('@docusaurus/preset-classic');
    expect(mockTryRequireStub).toHaveBeenCalledWith('@docusaurus/core/package.json');
    await expect(async () => await docsView(mockGasket)).rejects.toThrow();
  });
});
