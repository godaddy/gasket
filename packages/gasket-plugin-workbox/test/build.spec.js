import { vi } from 'vitest';

vi.mock('workbox-build', () => {
  const copyWorkboxLibraries = vi.fn();
  return {
    copyWorkboxLibraries
  };
});

import build from '../lib/build.js';
import { getOutputDir, defaultConfig } from '../lib/utils.js';
import { copyWorkboxLibraries } from 'workbox-build';

describe('build', () => {
  let mockGasket;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGasket = {
      config: {
        root: '/some-root',
        workbox: defaultConfig
      }
    };
  });

  it('copies workbox libraries to output dir', async () => {
    await build(mockGasket);
    const expectedOutput = getOutputDir(mockGasket);
    expect(copyWorkboxLibraries).toHaveBeenCalledWith(expectedOutput);
  });
});
