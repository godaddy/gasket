import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discoverTemplates } from '../src/discovery.js';
import fs from 'fs';
import path from 'path';

vi.mock('fs');

describe('discovery', () => {
  const mockPackagesDir = '/repo/packages';

  beforeEach(() => {
    vi.mocked(fs.readdirSync).mockReset();
    vi.mocked(fs.existsSync).mockReset();
  });

  it('returns only dirs matching templateFilter', () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: 'gasket-template-webapp-app', isDirectory: () => true },
      { name: 'gasket-template-api-express', isDirectory: () => true },
      { name: 'gasket-plugin-auth', isDirectory: () => true },
      { name: 'other-pkg', isDirectory: () => true }
    ]);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const str = String(p);
      return str.endsWith('template') || str.endsWith('template/package.json') || str.endsWith('node_modules') || str.endsWith('package-lock.json');
    });

    const result = discoverTemplates({
      packagesDir: mockPackagesDir,
      templateFilter: 'gasket-template-'
    });

    expect(result).toHaveLength(2);
    expect(result.map(t => t.name)).toEqual(['gasket-template-webapp-app', 'gasket-template-api-express']);
    expect(result[0]).toHaveProperty('packageDir');
    expect(result[0]).toHaveProperty('templateDir');
    expect(result[0].templateDir).toContain('template');
    expect(result[0]).toHaveProperty('hasPackageJson');
    expect(result[0]).toHaveProperty('hasNodeModules');
    expect(result[0]).toHaveProperty('hasLockfile');
  });

  it('filters out packages without template dir', () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: 'gasket-template-a', isDirectory: () => true }
    ]);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      return String(p).endsWith('package.json') || String(p).endsWith('node_modules') || String(p).endsWith('package-lock.json');
      // template dir itself: path.join(packageDir, 'template') - we return false for that
    });
    // existsSync for templateDir (path ending in /template) returns false
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = String(p);
      if (s === path.join(mockPackagesDir, 'gasket-template-a', 'template')) return false;
      return s.endsWith('package.json') || s.endsWith('node_modules') || s.endsWith('package-lock.json');
    });

    const result = discoverTemplates({
      packagesDir: mockPackagesDir,
      templateFilter: 'gasket-template-'
    });

    expect(result).toHaveLength(0);
  });

  it('passes only directories to filter', () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: 'gasket-template-app', isDirectory: () => true },
      { name: 'gasket-template-foo.txt', isDirectory: () => false }
    ]);
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = discoverTemplates({
      packagesDir: mockPackagesDir,
      templateFilter: 'gasket-template-'
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('gasket-template-app');
  });
});
