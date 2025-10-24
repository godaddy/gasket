import { vi } from 'vitest';

vi.mock('../lib/build-manifest.js', () => ({ default: vi.fn().mockResolvedValue() }));

const mockBuildManifest = vi.mocked(await import('../lib/build-manifest.js')).default;

import postCreateHook from '../lib/post-create.js';

describe('build', function () {
  let mockGasket;
  let mockContext;

  beforeEach(function () {
    mockGasket = {
      config: {
        intl: {
          managerFilename: 'intl.js'
        }
      }
    };

    mockContext = {
      dest: '/path/to/dest',
      generatedFiles: new Set(),
      hasGasketIntl: true
    };
  });

  afterEach(function () {
    vi.clearAllMocks();
  });

  it('builds manifest file', async function () {
    const expectedOptions = {
      root: mockContext.dest,
      silent: true
    };

    await postCreateHook(mockGasket, mockContext);
    expect(mockBuildManifest).toHaveBeenCalledWith(mockGasket, expectedOptions);
  });

  it('adds manager filename to generated files', async function () {
    await postCreateHook(mockGasket, mockContext);
    expect(mockContext.generatedFiles.has(mockGasket.config.intl.managerFilename)).toBe(true);
  });

  it('skips if not to be included', async function () {
    mockContext.hasGasketIntl = false;

    await postCreateHook(mockGasket, mockContext);
    expect(mockBuildManifest).not.toHaveBeenCalled();
  });
});
