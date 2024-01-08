const path = require('path');
const mockRequireWithInstall = jest.fn();
const mockStartStub = jest.fn();
const mockTryRequireStub = jest.fn();
const mockGasketLoggerInfo = jest.fn();
const mockRunShellCommand = jest.fn();
const mockWriteFileStub = jest.fn();
const mockExistsStub = jest.fn();

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
jest.mock('@gasket/utils', () => ({
  requireWithInstall: mockRequireWithInstall,
  tryRequire: mockTryRequireStub,
  runShellCommand: mockRunShellCommand
}));
jest.mock('@docusaurus/preset-classic', () => ({}));

const pluginConfigFile = 'docusaurus.config.js';
const docsView = require('../lib/docs-view');


describe('docsView', () => {
  let mockGasket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireWithInstall.mockReturnValue({ start: mockStartStub });

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
      },
      logger: {
        info: mockGasketLoggerInfo
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

  it('installs devDependencies if not present', async function () {
    mockTryRequireStub.mockReturnValue(false);
    await docsView(mockGasket);
    expect(mockGasketLoggerInfo).toHaveBeenCalledWith('Installing devDependencie(s) - installing "@docusaurus/preset-classic" with "npm" - save as a devDependency to avoid this');
    expect(mockRunShellCommand).toHaveBeenCalledWith('npm', ['install', '@docusaurus/preset-classic', '--no-save']);
  });

  it('does not install devDependencies if present', async function () {
    mockTryRequireStub.mockReturnValue(true);
    await docsView(mockGasket);
    expect(mockRunShellCommand).not.toHaveBeenCalled();
  });

  it('uses requireWithInstall to load @docusaurus/core/lib', async function () {
    await docsView(mockGasket);
    expect(mockRequireWithInstall).toHaveBeenCalledWith('@docusaurus/core/lib', mockGasket);
  });
});
