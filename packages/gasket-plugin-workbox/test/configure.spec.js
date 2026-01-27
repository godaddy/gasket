import { vi } from 'vitest';

vi.mock('workbox-build/package.json', () => ({
  default: {
    version: '4.1.0'
  }
}));

import { defaultConfig } from '../lib/utils.js';
import configure from '../lib/configure.js';

describe('configure', () => {
  let results, mockGasket;

  beforeAll(() => {
    mockGasket = {
      logger: {
        warn: vi.fn()
      },
      config: {
        root: '/some-root'
      }
    };
  });

  it('returns config with workbox settings', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results).toHaveProperty('workbox');
  });

  it('retains base config settings', async () => {
    results = await configure(mockGasket, {
      ...mockGasket.config,
      bogus: 'BOGUS'
    });
    expect(results).toHaveProperty('bogus', 'BOGUS');
  });

  it('sets defaults', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox).toEqual(
      expect.objectContaining({
        ...defaultConfig,
        config: {
          ...defaultConfig.config,
          importScripts: expect.any(Array)
        }
      })
    );
  });

  it('sets library version', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox).toHaveProperty(
      'libraryVersion',
      expect.stringContaining('workbox-v')
    );
  });

  it('add library script to imports', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox.config).toHaveProperty(
      'importScripts',
      expect.arrayContaining([
        expect.stringContaining('_workbox/workbox-v'),
        expect.stringContaining('workbox-sw.js')
      ])
    );
  });

  it('add basePath to script path', async () => {
    mockGasket.config.workbox = {
      basePath: '/some/prefix'
    };
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox.config).toHaveProperty(
      'importScripts',
      expect.arrayContaining([
        expect.stringContaining('/some/prefix'),
        expect.stringContaining('_workbox/workbox'),
        expect.stringContaining('workbox-sw.js')
      ])
    );
  });

  it('allows workbox settings to be customized by user', async () => {
    results = await configure(mockGasket, {
      ...mockGasket.config,
      workbox: {
        config: {
          globStrict: true
        }
      }
    });
    expect(results.workbox).toHaveProperty('config', expect.any(Object));
    expect(results.workbox.config).toHaveProperty('globStrict', true);
  });

  it('logs deprecation warning', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(mockGasket.logger.warn).toHaveBeenCalledWith(
      expect.stringMatching(/DEPRECATED `@gasket\/plugin-workbox` will not be support in future major release\./)
    );
  });
});
