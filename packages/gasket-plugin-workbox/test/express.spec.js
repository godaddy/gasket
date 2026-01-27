import { vi } from 'vitest';

vi.mock('serve-static', () => {
  return {
    default: vi.fn().mockReturnValue(() => {})
  };
});

import express from '../lib/express.js';
import { getOutputDir, defaultConfig } from '../lib/utils.js';
import serveStatic from 'serve-static';

describe('express', () => {
  let mockGasket, mockApp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGasket = {
      config: {
        root: '/some-root',
        workbox: defaultConfig
      }
    };
    mockApp = {
      use: vi.fn()
    };
  });

  it('sets up endpoint', () => {
    express(mockGasket, mockApp);
    expect(mockApp.use).toHaveBeenCalledWith('/_workbox', expect.any(Function));
  });

  it('sets up endpoint to with serve static', () => {
    express(mockGasket, mockApp);
    const expectedOutput = getOutputDir(mockGasket);
    expect(serveStatic).toHaveBeenCalledWith(
      expectedOutput,
      expect.objectContaining({
        index: false,
        maxAge: '1y',
        immutable: true
      }));
  });
});
