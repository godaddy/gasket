import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

vi.mock('fs');

describe('regen', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls runCommandCaptureStderr and succeeds when code is 0', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = String(p);
      return s.endsWith('package.json') || s.endsWith('package-lock.json') || s.endsWith('node_modules');
    });

    const utilsFs = await import('../../src/utils/fs.js');
    vi.spyOn(utilsFs, 'rmFile').mockReturnValue(false);
    vi.spyOn(utilsFs, 'rmRecursive').mockReturnValue(false);

    const { handler } = await import('../../src/operations/regen.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });

    expect(runner.runCommandCaptureStderr).toHaveBeenCalledWith('npm', ['install'], baseTemplate.templateDir);
    expect(runner.runCommand).not.toHaveBeenCalled();
  });

  it('retries with runCommand when runCommandCaptureStderr returns peer dep error', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('package.json'));

    const utilsFs = await import('../../src/utils/fs.js');
    vi.spyOn(utilsFs, 'rmFile').mockReturnValue(false);
    vi.spyOn(utilsFs, 'rmRecursive').mockReturnValue(false);

    const { handler } = await import('../../src/operations/regen.js');
    const runner = mockRunner();
    runner.runCommandCaptureStderr.mockResolvedValue({ code: 1, stderr: 'ERESOLVE peer dependency' });

    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });

    expect(runner.runCommandCaptureStderr).toHaveBeenCalled();
    expect(runner.runCommand).toHaveBeenCalledWith('npm', ['install', '--legacy-peer-deps'], baseTemplate.templateDir);
  });
});
