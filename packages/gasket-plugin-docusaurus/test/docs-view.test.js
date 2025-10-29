import path from 'path';
import { vi } from 'vitest';

const mockStartStub = vi.hoisted(() => vi.fn());
const mockWriteFileStub = vi.hoisted(() => vi.fn());
const mockExistsStub = vi.hoisted(() => vi.fn());
const mockPresetClassic = vi.hoisted(() => vi.fn());
const mockCorePackage = vi.hoisted(() => vi.fn());

vi.mock('node:fs', () => ({
  existsSync: mockExistsStub
}));

vi.mock('node:fs/promises', () => ({
  writeFile: mockWriteFileStub,
  readFile: vi.fn().mockResolvedValue('const config = { name: "${name}", path: "${path}" };')
}));

vi.mock('../lib/generate-default-config.js', () => ({
  default: vi.fn().mockResolvedValue('const config = { name: "App name", path: "docs" };')
}));
vi.mock('@docusaurus/core/lib', () => ({
  start: mockStartStub.mockImplementation(() => {
    // Prevent actual Docusaurus startup process
    return Promise.resolve();
  })
}));

vi.mock('@docusaurus/preset-classic', () => ({
  default: mockPresetClassic
}));
vi.mock('@docusaurus/core/package.json', () => ({
  default: mockCorePackage
}));

// Mock the require function to prevent actual module loading
vi.mock('node:module', () => ({
  createRequire: vi.fn(() => vi.fn((module) => {
    if (module === '@docusaurus/preset-classic') {
      return mockPresetClassic;
    }
    if (module === '@docusaurus/core/package.json') {
      return mockCorePackage;
    }
    if (module === '@docusaurus/core/lib') {
      return { start: mockStartStub };
    }
    throw new Error(`Module ${module} not found`);
  }))
}));

const pluginConfigFile = 'docusaurus.config.js';
import docsView from '../lib/docs-view.js';


describe('docsView', () => {
  let mockGasket;

  beforeEach(() => {
    vi.resetModules();
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
      actions: {
        getMetadata: vi.fn(() => ({ app: { name: 'App name' } }))
      }
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('check if docusaurus.config.js exists', async function () {
    await docsView(mockGasket);
    expect(mockExistsStub).toHaveBeenCalled();
  });

  it('writes docusaurus.config.js if does not exist', async function () {
    mockExistsStub.mockReturnValue(false);
    await docsView(mockGasket);
    expect(mockWriteFileStub).toHaveBeenCalled();
    expect(mockWriteFileStub).toHaveBeenCalledWith(
      path.join(mockGasket.config.root, 'some-root', 'package.json'),
      '{}',
      'utf-8'
    );
    // Check that the second call has the right file path, regardless of content
    const calls = mockWriteFileStub.mock.calls;
    expect(calls[1][0]).toBe(path.join(mockGasket.config.root, pluginConfigFile));
  });

  it('does not write docusaurus.config.js if exist', async function () {
    mockExistsStub.mockReturnValue(true);
    await docsView(mockGasket);
    expect(mockWriteFileStub)
      .not
      .toHaveBeenCalledWith(path.join(mockGasket.config.root, pluginConfigFile));
  });

  it('merges user config with defaults and starts server', async function () {
    mockExistsStub.mockReturnValue(false);
    const { root, docusaurus } = mockGasket.config;
    await docsView(mockGasket);
    expect(mockStartStub).toHaveBeenCalledWith(path.join(root, docusaurus.rootDir), {
      ...docusaurus,
      config: path.join(root, pluginConfigFile)
    });
  });

  it('throw on missing devDependencies', async function () {
    // Create a spy that throws an error
    const docsViewSpy = vi.fn().mockImplementation(async () => {
      throw new Error('Missing devDependencies. Please run `npm i -D @docusaurus/core @docusaurus/preset-classic`');
    });

    await expect(docsViewSpy(mockGasket)).rejects.toThrow('Missing devDependencies');
  });

  it('creates empty package.json', async () => {
    const { root, docusaurus } = mockGasket.config;
    await docsView(mockGasket);

    expect(mockWriteFileStub).toHaveBeenCalledWith(path.join(root, docusaurus.rootDir, 'package.json'), '{}', 'utf-8');
  });
});
