import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

vi.mock('fs');

describe('update-deps', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls npm-check-updates -u with packageFile and filter (no npm install)', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const { handler } = await import('../../src/operations/update-deps.js');
    const runner = mockRunner();
    await handler(baseTemplate, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      flags: {}
    });

    expect(runner.runCommand).toHaveBeenCalledTimes(1);
    expect(runner.runCommand).toHaveBeenNthCalledWith(
      1,
      'npx',
      ['npm-check-updates', '-u', '--packageFile', 'packages/gasket-template-webapp-app/template/package.json', '--filter', baseConfig.updateDepsFilter],
      '/repo',
      { npm_config_loglevel: 'error' }
    );
  });

  it('skips when package.json does not exist', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const { handler } = await import('../../src/operations/update-deps.js');
    const runner = mockRunner();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });

    expect(runner.runCommand).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('uses --pkg flag to build exact-name filter', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const { handler } = await import('../../src/operations/update-deps.js');
    const runner = mockRunner();
    await handler(baseTemplate, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      flags: { pkg: 'eslint' }
    });

    expect(runner.runCommand).toHaveBeenNthCalledWith(
      1,
      'npx',
      ['npm-check-updates', '-u', '--packageFile', 'packages/gasket-template-webapp-app/template/package.json', '--filter', '^eslint$'],
      '/repo',
      { npm_config_loglevel: 'error' }
    );
  });

  it('uses --filter flag when provided', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const { handler } = await import('../../src/operations/update-deps.js');
    const runner = mockRunner();
    await handler(baseTemplate, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      flags: { filter: '^eslint$' }
    });

    expect(runner.runCommand).toHaveBeenNthCalledWith(
      1,
      'npx',
      ['npm-check-updates', '-u', '--packageFile', 'packages/gasket-template-webapp-app/template/package.json', '--filter', '^eslint$'],
      '/repo',
      { npm_config_loglevel: 'error' }
    );
  });
});
