import { vi } from 'vitest';

vi.mock('path', () => {
  const mockJoin = vi.fn((...args) => args.join('/'));
  return {
    default: {
      join: mockJoin
    },
    join: mockJoin
  };
});

import configure from '../lib/configure.js';
import baseConfig from '../lib/base-config.js';
import path from 'path';

describe('configure', function () {
  let gasket;

  beforeEach(function () {
    vi.clearAllMocks();
    gasket = {
      execWaterfall: vi.fn().mockResolvedValue([]),
      config: {
        manifest: {
          name: 'Walter White',
          superpower: 'Chemistry'
        },
        serviceWorker: {
          url: 'sw.js'
        },
        root: 'test/'
      },
      logger: {
        debug: vi.fn()
      }
    };
  });

  it('is a function', function () {
    expect(typeof configure).toBe('function');
  });

  it('merges base config with the manifest config', function () {
    const scope = '/custom';
    const config = { manifest: { scope } };

    const results = configure(gasket, config);

    expect(results.manifest).toEqual(
      expect.objectContaining({ ...baseConfig, scope })
    );
  });

  it('works with defaults when not configured', function () {
    const config = {};

    const results = configure(gasket, config);

    expect(results.manifest).toEqual(baseConfig);
  });

  it('uses default path when staticOutput is true', function () {
    const staticOutput = true;
    const config = { manifest: { staticOutput } };

    configure(gasket, config);

    expect(path.join.mock.calls[0][1]).toEqual('public/manifest.json');
  });

  it('uses custom path when passed from manifest', function () {
    const staticOutput = 'custom/path/manifest.json';
    const config = { manifest: { staticOutput } };

    configure(gasket, config);

    expect(path.join.mock.calls[0][1]).toEqual(staticOutput);
  });

  it('sets static output to false when not configured', function () {
    configure(gasket, { manifest: {} });
    expect(path.join).not.toHaveBeenCalled();
  });
});
