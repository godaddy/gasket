import { vi } from 'vitest';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn()
}));
vi.mock('mkdirp', () => ({
  default: vi.fn()
}));
vi.mock('../lib/utils.js', () => ({
  gatherManifestData: vi.fn().mockResolvedValue({})
}));

import build from '../lib/build.js';
import { writeFile } from 'fs/promises';
import mkdirp from 'mkdirp';

describe('build', function () {
  let gasket;

  beforeEach(function () {
    vi.clearAllMocks();
    gasket = {
      execWaterfall: vi.fn().mockResolvedValue([]),
      config: {
        root: 'test',
        manifest: {
          staticOutput: '/custom/manifest.json'
        }
      },
      logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn()
      }
    };
  });

  it('is a function', function () {
    expect(typeof build).toBe('function');
    expect(build).toHaveLength(1);
  });

  it('skips logic when staticOutput config is not set', async function () {
    gasket.config.manifest = {};
    await build(gasket);

    expect(mkdirp).not.toHaveBeenCalled();
  });

  it('creates custom output directory', async function () {
    gasket.config.manifest.staticOutput =
      '/super/cool/custom/path/manifest.json';
    await build(gasket);
    expect(mkdirp).toHaveBeenCalled();
    expect(mkdirp.mock.calls[0][0]).toEqual('/super/cool/custom/path/');
  });

  it('writes manifest to specified path', async function () {
    await build(gasket);
    expect(writeFile.mock.calls.length).toBe(1);
    expect(writeFile.mock.calls[0]).toEqual([
      '/custom/manifest.json',
      '{}',
      'utf-8'
    ]);
  });

  it('logs completion message', async function () {
    await build(gasket);
    expect(gasket.logger.info.mock.calls.length).toBe(1);
    expect(gasket.logger.info.mock.calls[0][0]).toContain(
      'custom/manifest.json).'
    );
  });
});
