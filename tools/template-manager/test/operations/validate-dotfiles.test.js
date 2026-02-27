import { describe, it, expect, vi, beforeEach } from 'vitest';
import { baseTemplate, baseConfig } from '../helpers.js';

vi.mock('fs');
vi.mock('child_process');

describe('validate-dotfiles', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when dot files are missing from pack list', async () => {
    const fs = await import('fs');
    const { execSync } = await import('child_process');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('');
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: '.npmrc', isDirectory: () => false },
      { name: '.env', isDirectory: () => false }
    ]);
    vi.mocked(execSync).mockReturnValue(JSON.stringify([
      { files: [{ path: 'template/.npmrc' }] }
    ]));

    const { handler } = await import('../../src/operations/validate-dotfiles.js');
    await expect(
      handler(baseTemplate, { config: baseConfig, flags: {} })
    ).rejects.toThrow(/will not be packed/);
  });

  it('succeeds when all dot files are in pack list', async () => {
    const fs = await import('fs');
    const { execSync } = await import('child_process');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('');
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: '.npmrc', isDirectory: () => false },
      { name: '.gitignore', isDirectory: () => false }
    ]);
    vi.mocked(execSync).mockReturnValue(JSON.stringify([
      { files: [{ path: 'template/.npmrc' }, { path: 'template/.gitignore' }] }
    ]));

    const { handler } = await import('../../src/operations/validate-dotfiles.js');
    await expect(
      handler(baseTemplate, { config: baseConfig, flags: {} })
    ).resolves.toBeUndefined();
  });
});
