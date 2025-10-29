import { vi } from 'vitest';

vi.mock('../lib/build-manifest.js', () => ({ default: vi.fn().mockResolvedValue() }));
vi.mock('../lib/build-modules.js', () => ({ default: vi.fn().mockResolvedValue() }));

const mockBuildManifest = vi.mocked(await import('../lib/build-manifest.js')).default;
const mockBuildModules = vi.mocked(await import('../lib/build-modules.js')).default;

import plugin from '../lib/index.js';

describe('build', function () {
  let mockGasket, buildHook;

  beforeEach(function () {
    mockGasket = {
      config: {
        intl: {}
      }
    };

    buildHook = plugin.hooks.build;
  });

  it('has expected timing', function () {
    expect(buildHook).toHaveProperty('timing');
    expect(buildHook.timing).toHaveProperty('first', true);
  });

  it('builds manifest file', async function () {
    await buildHook.handler(mockGasket);
    expect(mockBuildModules).not.toHaveBeenCalled();
    expect(mockBuildManifest).toHaveBeenCalledWith(mockGasket);
  });

  it('builds modules if set in config', async function () {
    mockGasket.config.intl.modules = {};
    await buildHook.handler(mockGasket);
    expect(mockBuildModules).toHaveBeenCalledWith(mockGasket);
    expect(mockBuildManifest).toHaveBeenCalledWith(mockGasket);
  });
});
