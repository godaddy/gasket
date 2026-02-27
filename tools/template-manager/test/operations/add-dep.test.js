import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseConfig } from '../helpers.js';

vi.mock('../../src/utils/fs.js', () => ({
  readJson: vi.fn(),
  writeJson: vi.fn()
}));

const templates = [
  {
    name: 'gasket-template-a',
    templateDir: '/repo/packages/gasket-template-a/template',
    packageDir: '/repo/packages/gasket-template-a',
    hasPackageJson: true
  },
  {
    name: 'gasket-template-b',
    templateDir: '/repo/packages/gasket-template-b/template',
    packageDir: '/repo/packages/gasket-template-b',
    hasPackageJson: true
  }
];

describe('add-dep', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('adds dependency to all templates with resolved version', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ name: 'pkg', dependencies: {}, devDependencies: {} });

    const runner = mockRunner();
    runner.runCommandCaptureStdout.mockResolvedValue({ code: 0, stdout: '"1.2.3"' });

    const { handler } = await import('../../src/operations/add-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      results,
      flags: { positional: ['lodash'] }
    });

    expect(writeJson).toHaveBeenCalledTimes(2);
    const written = writeJson.mock.calls[0][1];
    expect(written.dependencies.lodash).toBe('^1.2.3');
    expect(results.record).toHaveBeenCalledWith('gasket-template-a', 'passed');
    consoleSpy.mockRestore();
  });

  it('adds to devDependencies when --dev flag is set', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ name: 'pkg', dependencies: {}, devDependencies: {} });

    const runner = mockRunner();
    runner.runCommandCaptureStdout.mockResolvedValue({ code: 0, stdout: '"2.0.0"' });

    const { handler } = await import('../../src/operations/add-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      results,
      flags: { positional: ['typescript'], dev: true }
    });

    const written = writeJson.mock.calls[0][1];
    expect(written.devDependencies.typescript).toBe('^2.0.0');
    expect(written.dependencies.typescript).toBeUndefined();
    consoleSpy.mockRestore();
  });

  it('uses explicit version when provided', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ name: 'pkg', dependencies: {}, devDependencies: {} });

    const runner = mockRunner();
    const { handler } = await import('../../src/operations/add-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      results,
      flags: { positional: ['lodash@4.17.21'] }
    });

    expect(runner.runCommandCaptureStdout).not.toHaveBeenCalled();
    const written = writeJson.mock.calls[0][1];
    expect(written.dependencies.lodash).toBe('^4.17.21');
    consoleSpy.mockRestore();
  });

  it('throws when no package spec provided', async () => {
    const { handler } = await import('../../src/operations/add-dep.js');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(handler(templates, {
      runner: mockRunner(),
      config: baseConfig,
      results: { record: vi.fn() },
      flags: { positional: [] }
    })).rejects.toThrow('Missing package spec');

    consoleSpy.mockRestore();
  });

  it('skips templates without package.json', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValueOnce({ name: 'a', dependencies: {} }).mockReturnValueOnce(null);

    const runner = mockRunner();
    runner.runCommandCaptureStdout.mockResolvedValue({ code: 0, stdout: '"1.0.0"' });

    const { handler } = await import('../../src/operations/add-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      results,
      flags: { positional: ['foo'] }
    });

    expect(writeJson).toHaveBeenCalledTimes(1);
    expect(results.record).toHaveBeenCalledWith('gasket-template-b', 'skipped', 'no package.json');
    consoleSpy.mockRestore();
  });
});
