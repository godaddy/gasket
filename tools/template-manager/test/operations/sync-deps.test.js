import path from 'path';
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

describe('sync-deps', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aligns shared dep versions, writes package.json, and reports changes (no npm install)', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson
      .mockImplementation((p) => {
        if (p.includes('gasket-template-a')) {
          return { name: 'a', dependencies: { lodash: '^4.17.0' }, devDependencies: {} };
        }
        if (p.includes('gasket-template-b')) {
          return { name: 'b', dependencies: { lodash: '^4.21.0' }, devDependencies: {} };
        }
        return null;
      });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { handler } = await import('../../src/operations/sync-deps.js');
    const results = { record: vi.fn() };
    await handler(templates, {
      runner: mockRunner(),
      config: { ...baseConfig, root: '/repo' },
      results,
      flags: {}
    });

    expect(readJson).toHaveBeenCalledTimes(2);
    expect(writeJson).toHaveBeenCalledTimes(2);
    const writtenA = writeJson.mock.calls.find(
      (c) => c[0] === path.join(templates[0].templateDir, 'package.json')
    );
    const writtenB = writeJson.mock.calls.find(
      (c) => c[0] === path.join(templates[1].templateDir, 'package.json')
    );
    expect(writtenA[1].dependencies.lodash).toBe('^4.21.0');
    expect(writtenB[1].dependencies.lodash).toBe('^4.21.0');

    const logCalls = logSpy.mock.calls.map((c) => c.join(' '));
    expect(logCalls.some((s) => s.includes('template regen') || s.includes('refresh lockfiles'))).toBe(true);
    logSpy.mockRestore();
  });

  it('does not use syncpack or workspace globs', async () => {
    const { readJson } = await import('../../src/utils/fs.js');
    readJson.mockImplementation((p) =>
      p.includes('package.json')
        ? { name: 'x', dependencies: { a: '^1.0.0' }, devDependencies: {} }
        : null
    );

    const { handler } = await import('../../src/operations/sync-deps.js');
    const runner = mockRunner();
    const results = { record: vi.fn() };
    await handler(templates, {
      runner,
      config: { ...baseConfig, root: '/repo' },
      results,
      flags: {}
    });

    expect(runner.runCommand).not.toHaveBeenCalled();
  });

  it('skips templates with no package.json', async () => {
    const { readJson } = await import('../../src/utils/fs.js');
    readJson
      .mockReturnValueOnce({ name: 'a', dependencies: {}, devDependencies: {} })
      .mockReturnValueOnce(null);

    const { handler } = await import('../../src/operations/sync-deps.js');
    const results = { record: vi.fn() };
    await handler(templates, {
      runner: mockRunner(),
      config: { ...baseConfig, root: '/repo' },
      results,
      flags: {}
    });

    expect(results.record).toHaveBeenCalledWith('gasket-template-b', 'skipped', 'no package.json');
    expect(results.record).toHaveBeenCalledWith('gasket-template-a', 'passed');
  });
});
