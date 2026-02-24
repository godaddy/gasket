import { describe, it, expect, vi, beforeEach } from 'vitest';
import { baseTemplate, baseConfig } from '../helpers.js';

vi.mock('fs');

describe('clean', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls rmRecursive for dirs that exist', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = String(p);
      return s.endsWith('.next') || s.endsWith('node_modules');
    });
    const utilsFs = await import('../../src/utils/fs.js');
    const spyRm = vi.spyOn(utilsFs, 'rmRecursive').mockReturnValue(true);

    const { handler } = await import('../../src/operations/clean.js');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler(baseTemplate, { config: baseConfig });

    expect(spyRm).toHaveBeenCalled();
    const callPaths = spyRm.mock.calls.map(c => c[0]);
    expect(callPaths.some(p => String(p).endsWith('.next'))).toBe(true);
    expect(callPaths.some(p => String(p).endsWith('node_modules'))).toBe(true);
    consoleSpy.mockRestore();
  });
});
