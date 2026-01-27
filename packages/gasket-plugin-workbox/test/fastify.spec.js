import { vi } from 'vitest';

vi.mock('serve-static', () => {
  return {
    default: vi.fn().mockReturnValue(() => {})
  };
});

import fastify from '../lib/fastify.js';
import { getOutputDir, defaultConfig } from '../lib/utils.js';
import serveStatic from 'serve-static';

describe('fastify', () => {
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
      register: vi.fn()
    };
  });

  it('sets up endpoint', () => {
    fastify(mockGasket, mockApp);
    expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), { prefix: '/_workbox' });
  });

  it('sets up endpoint to with serve static', () => {
    fastify(mockGasket, mockApp);
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
