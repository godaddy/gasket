import { vi } from 'vitest';
import path from 'path';

vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('mock-content'),
  writeFile: vi.fn(),
  copyFile: vi.fn(),
  stat: vi.fn().mockResolvedValue({ isFile: () => true })
}));
vi.mock('mkdirp', () => ({ default: vi.fn() }));
vi.mock('rimraf', () => ({ rimraf: vi.fn() }));

import collateFiles from '../../lib/utils/collate-files.js';
import { readFile, writeFile, copyFile, stat } from 'fs/promises';
import mkdirp from 'mkdirp';
import { rimraf } from 'rimraf';

const processModuleSpy = vi.spyOn(collateFiles, 'processModule');
const { processModule } = collateFiles;

// Get references to the mocked functions
const mockReadFileStub = vi.mocked(readFile);
const mockWriteFileStub = vi.mocked(writeFile);
const mockCopyFileStub = vi.mocked(copyFile);
const mockStatStub = vi.mocked(stat);
const mockMkdirpStub = vi.mocked(mkdirp);
const mockRimrafStub = vi.mocked(rimraf);

const mockLocalTransform = {
  test: /README\.md$/,
  handler: vi.fn(f => f + '-local')
};

const mockGlobalTransform = {
  global: true,
  test: /\.md$/,
  handler: vi.fn(f => f + '-global')
};

const mockNoMatchTransform = {
  test: /NOTHING$/,
  handler: vi.fn(f => f + '-NOTHING')
};

const mockDocsConfigSet = {
  app: {
    name: 'test-app',
    description: 'Some test app',
    link: 'README.md#overview',
    sourceRoot: '/path/to/app',
    targetRoot: '/path/to/app/.docs/test-app',
    files: [
      'README.md'
    ]
  },
  plugins: [{
    name: 'example-plugin',
    link: 'README.md',
    sourceRoot: '/path/to/node_modules/example-plugin',
    targetRoot: '/path/to/app/.docs/test-app/plugins/example-plugin',
    files: [
      'README.md',
      'deep/file.txt',
      'deep/er/image.svg',
      'docs/API.md'
    ],
    transforms: [
      mockLocalTransform,
      mockNoMatchTransform
    ]
  }],
  presets: [{
    name: 'example-preset',
    link: 'README.md',
    sourceRoot: '/path/to/node_modules/example-plugin',
    targetRoot: '/path/to/app/.docs/test-app/presets/example-preset',
    files: [
      'README.md'
    ]
  }],
  modules: [{
    name: 'example-module',
    link: 'README.md',
    sourceRoot: '/path/to/node_modules/example-module',
    targetRoot: '/path/to/app/.docs/test-app/modules/example-module',
    files: [
      'README.md'
    ]
  }],
  transforms: [
    mockGlobalTransform
  ],
  root: '/path/to/app',
  docsRoot: '/path/to/app/.docs'
};

describe('Utils - collateFiles', () => {
  let mockDocConfig;

  beforeEach(() => {
    mockDocConfig = mockDocsConfigSet.plugins[0];

    mockStatStub.mockImplementation((filePath) => {
      if (filePath.includes('directory')) {
        return Promise.resolve({
          isFile: () => false,
          isDirectory: () => true
        });
      }
      return Promise.resolve({ isFile: () => true, isDirectory: () => false });
    });
  });

  it('makes output dir', async () => {
    await collateFiles(mockDocsConfigSet);
    expect(mockMkdirpStub).toHaveBeenCalledWith(mockDocsConfigSet.docsRoot);
  });

  it('cleans output dir', async () => {
    await collateFiles(mockDocsConfigSet);
    expect(mockRimrafStub).toHaveBeenCalledWith(mockDocsConfigSet.docsRoot + '/*');
  });

  it('processes app docConfig', async () => {
    await collateFiles(mockDocsConfigSet);
    expect(processModuleSpy).toHaveBeenCalledWith(mockDocsConfigSet.app, mockDocsConfigSet);
  });

  it('processes all moduleDocConfigs', async () => {
    await collateFiles(mockDocsConfigSet);
    expect(processModuleSpy).toHaveBeenCalledWith(mockDocsConfigSet.plugins[0], mockDocsConfigSet);
    expect(processModuleSpy).toHaveBeenCalledWith(mockDocsConfigSet.presets[0], mockDocsConfigSet);
    expect(processModuleSpy).toHaveBeenCalledWith(mockDocsConfigSet.modules[0], mockDocsConfigSet);
  });

  describe('processModule', () => {
    it('makes target dirs', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      expect(mockMkdirpStub).toHaveBeenCalledWith(mockDocConfig.targetRoot);
      expect(mockMkdirpStub).toHaveBeenCalledWith(path.join(mockDocConfig.targetRoot, 'deep'));
      expect(mockMkdirpStub).toHaveBeenCalledWith(path.join(mockDocConfig.targetRoot, 'deep', 'er'));
    });

    it('skips directories in files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      expect(mockCopyFileStub).not.toHaveBeenCalledWith(
        expect.stringContaining('directory'),
        expect.any(String)
      );
      expect(mockReadFileStub).not.toHaveBeenCalledWith(
        expect.stringContaining('directory'),
        'utf8'
      );
    });

    it('copies files that do not need transformed', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, sourceRoot, targetRoot } = mockDocConfig;
      const filename = files[1];
      const expectedSource = path.join(sourceRoot, filename);
      const expectedTarget = path.join(targetRoot, filename);
      expect(mockCopyFileStub).toHaveBeenCalledWith(expectedSource, expectedTarget);
    });

    it('does not copy files that need transformed', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, sourceRoot, targetRoot } = mockDocConfig;
      const filename = files[0];
      const expectedSource = path.join(sourceRoot, filename);
      const expectedTarget = path.join(targetRoot, filename);
      expect(mockCopyFileStub).not.toHaveBeenCalledWith(expectedSource, expectedTarget);
    });

    it('loads content of transforming files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, sourceRoot } = mockDocConfig;
      const filename = files[0];
      const expectedSource = path.join(sourceRoot, filename);
      expect(mockReadFileStub).toHaveBeenCalledWith(expectedSource, 'utf8');
    });

    it('writes transformed files', async () => {
      mockWriteFileStub.mockReset();
      await processModule(mockDocConfig, mockDocsConfigSet);
      const { files, targetRoot } = mockDocConfig;
      const filename = files[0];
      const expectedTarget = path.join(targetRoot, filename);
      expect(mockWriteFileStub.mock.calls[0]).toEqual(
        expect.arrayContaining([expectedTarget])
      );
    });

    it('executes local transforms for files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      expect(mockWriteFileStub).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/-local/)
      );
    });

    it('executes global transforms for files', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      expect(mockWriteFileStub).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/-global/)
      );
    });

    it('executes local transforms before global', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      expect(mockWriteFileStub).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/-local-global/)
      );
    });

    it('does not apply transform handler if test does not match', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      expect(mockLocalTransform.handler).toHaveBeenCalled();
      expect(mockNoMatchTransform.handler).not.toHaveBeenCalled();
      expect(mockWriteFileStub).not.toHaveBeenCalledWith(
        expect.stringMatching(/-NOTHING/)
      );

      // make sure previous transformations are not lost
      expect(mockWriteFileStub).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/-local-global/)
      );
    });

    it('does not apply transforms that do not pass test', async () => {
      mockLocalTransform.handler.mockReset();
      mockGlobalTransform.handler.mockReset();
      await processModule(mockDocConfig, mockDocsConfigSet);
      // modifies only README.md files
      expect(mockLocalTransform.handler).toHaveBeenCalledTimes(1);
      // modifies all .md files
      expect(mockGlobalTransform.handler).toHaveBeenCalledTimes(2);
    });

    it('transform handler passed expected arguments', async () => {
      await processModule(mockDocConfig, mockDocsConfigSet);
      expect(mockGlobalTransform.handler).toHaveBeenCalledTimes(4);
      expect(mockGlobalTransform.handler.mock.calls[1][0]).toEqual('mock-content');
      expect(mockGlobalTransform.handler.mock.calls[1][1]).toEqual({
        filename: 'docs/API.md',
        docsConfig: mockDocConfig,
        docsConfigSet: mockDocsConfigSet
      });
    });
  });
});
