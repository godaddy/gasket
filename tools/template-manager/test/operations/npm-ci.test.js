/* eslint-disable no-undefined */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

vi.mock('fs');

describe('npm-ci', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls runCommand when shouldSkipNpmCi is false', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const { handler } = await import('../../src/operations/npm-ci.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });

    expect(runner.runCommand).toHaveBeenCalledTimes(1);
    expect(runner.runCommand).toHaveBeenCalledWith('npm', baseConfig.npmCiArgs, baseTemplate.templateDir);
  });

  it('skips runCommand when shouldSkipNpmCi is true', async () => {
    const fs = await import('fs');
    const nodeModulesPath = path.join(baseTemplate.templateDir, 'node_modules');
    const packageJsonPath = path.join(baseTemplate.templateDir, 'package.json');
    const packageLockPath = path.join(baseTemplate.templateDir, 'package-lock.json');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = String(p);
      return s === nodeModulesPath || s === packageJsonPath || s === packageLockPath;
    });
    vi.mocked(fs.readdirSync).mockReturnValue(['some-pkg']);
    vi.mocked(fs.statSync).mockImplementation((p) => {
      const s = String(p);
      const older = new Date('2020-01-01');
      const newer = new Date('2020-01-02');
      if (s === nodeModulesPath) return { mtime: newer, mtimeMs: newer.getTime() };
      if (s === packageJsonPath || s === packageLockPath) return { mtime: older, mtimeMs: older.getTime() };
      return { mtime: newer, mtimeMs: newer.getTime() };
    });

    const { handler } = await import('../../src/operations/npm-ci.js');
    const runner = mockRunner();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });

    expect(runner.runCommand).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('retries with --legacy-peer-deps when runCommand fails and retryWithLegacyPeerDeps is true', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const { handler } = await import('../../src/operations/npm-ci.js');
    const runner = mockRunner();
    runner.runCommand.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);

    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });

    expect(runner.runCommand).toHaveBeenCalledTimes(2);
    expect(runner.runCommand).toHaveBeenNthCalledWith(1, 'npm', baseConfig.npmCiArgs, baseTemplate.templateDir);
    expect(runner.runCommand).toHaveBeenNthCalledWith(2, 'npm', [...baseConfig.npmCiArgs, '--legacy-peer-deps'], baseTemplate.templateDir);
  });
});
