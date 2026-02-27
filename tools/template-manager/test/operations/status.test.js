import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseConfig } from '../helpers.js';

vi.mock('fs');
vi.mock('../../src/utils/fs.js', () => ({
  readJson: vi.fn()
}));

const templates = [
  {
    name: 'gasket-template-a',
    templateDir: '/repo/packages/gasket-template-a/template',
    packageDir: '/repo/packages/gasket-template-a',
    hasPackageJson: true,
    hasNodeModules: true,
    hasLockfile: true
  },
  {
    name: 'gasket-template-b',
    templateDir: '/repo/packages/gasket-template-b/template',
    packageDir: '/repo/packages/gasket-template-b',
    hasPackageJson: true,
    hasNodeModules: true,
    hasLockfile: true
  }
];

describe('status', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports template health status', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date('2024-01-01') });

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({
      dependencies: { lodash: '^4.17.21' },
      devDependencies: {}
    });

    const { handler } = await import('../../src/operations/status.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('gasket-template-a');
    expect(output).toContain('gasket-template-b');
    expect(results.record).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('detects stale deps when package.json is newer than node_modules', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('node_modules')) return { mtime: new Date('2024-01-01') };
      if (s.endsWith('package.json')) return { mtime: new Date('2024-01-02') };
      return { mtime: new Date('2024-01-01') };
    });

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ dependencies: {}, devDependencies: {} });

    const { handler } = await import('../../src/operations/status.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('stale');
    consoleSpy.mockRestore();
  });

  it('reports missing node_modules', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = String(p);
      if (s.endsWith('node_modules')) return false;
      return true;
    });

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ dependencies: {}, devDependencies: {} });

    const { handler } = await import('../../src/operations/status.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('no node_modules');
    expect(results.record).toHaveBeenCalledWith('gasket-template-a', 'failed', 'no node_modules');
    consoleSpy.mockRestore();
  });

  it('detects dependency version drift across templates', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date('2024-01-01') });

    const { readJson } = await import('../../src/utils/fs.js');
    readJson
      .mockReturnValueOnce({ dependencies: { lodash: '^4.17.0' }, devDependencies: {} })
      .mockReturnValueOnce({ dependencies: { lodash: '^4.21.0' }, devDependencies: {} });

    const { handler } = await import('../../src/operations/status.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('drift');
    expect(output).toContain('lodash');
    consoleSpy.mockRestore();
  });

  it('reports aligned dependencies', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ mtime: new Date('2024-01-01') });

    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ dependencies: { lodash: '^4.17.21' }, devDependencies: {} });

    const { handler } = await import('../../src/operations/status.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner: mockRunner(), config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('aligned');
    consoleSpy.mockRestore();
  });
});
