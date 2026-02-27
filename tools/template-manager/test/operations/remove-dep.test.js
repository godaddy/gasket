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

describe('remove-dep', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('removes dependency from all templates', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockImplementation(() => ({
      name: 'pkg',
      dependencies: { lodash: '^4.17.21', react: '^18.0.0' },
      devDependencies: {}
    }));

    const { handler } = await import('../../src/operations/remove-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner: mockRunner(),
      config: baseConfig,
      results,
      flags: { positional: ['lodash'] }
    });

    expect(writeJson).toHaveBeenCalledTimes(2);
    const written = writeJson.mock.calls[0][1];
    expect(written.dependencies.lodash).toBeUndefined();
    expect(written.dependencies.react).toBe('^18.0.0');
    expect(results.record).toHaveBeenCalledWith('gasket-template-a', 'passed');
    consoleSpy.mockRestore();
  });

  it('removes from devDependencies and peerDependencies too', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockImplementation(() => ({
      name: 'pkg',
      dependencies: {},
      devDependencies: { typescript: '^5.0.0' },
      peerDependencies: { typescript: '^5.0.0' }
    }));

    const { handler } = await import('../../src/operations/remove-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner: mockRunner(),
      config: baseConfig,
      results,
      flags: { positional: ['typescript'] }
    });

    const written = writeJson.mock.calls[0][1];
    expect(written.devDependencies.typescript).toBeUndefined();
    expect(written.peerDependencies.typescript).toBeUndefined();
    consoleSpy.mockRestore();
  });

  it('throws when no package name provided', async () => {
    const { handler } = await import('../../src/operations/remove-dep.js');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(handler(templates, {
      runner: mockRunner(),
      config: baseConfig,
      results: { record: vi.fn() },
      flags: { positional: [] }
    })).rejects.toThrow('Missing package name');

    consoleSpy.mockRestore();
  });

  it('skips templates without package.json', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValueOnce({ dependencies: { foo: '^1.0.0' } }).mockReturnValueOnce(null);

    const { handler } = await import('../../src/operations/remove-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner: mockRunner(),
      config: baseConfig,
      results,
      flags: { positional: ['foo'] }
    });

    expect(writeJson).toHaveBeenCalledTimes(1);
    expect(results.record).toHaveBeenCalledWith('gasket-template-b', 'skipped', 'no package.json');
    consoleSpy.mockRestore();
  });

  it('does not write if dep not found', async () => {
    const { readJson, writeJson } = await import('../../src/utils/fs.js');
    readJson.mockReturnValue({ dependencies: { react: '^18.0.0' } });

    const { handler } = await import('../../src/operations/remove-dep.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, {
      runner: mockRunner(),
      config: baseConfig,
      results,
      flags: { positional: ['lodash'] }
    });

    expect(writeJson).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
