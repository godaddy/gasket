import { describe, it, expect } from 'vitest';
import config from '../src/config.js';

describe('config', () => {
  it('has root and packagesDir paths', () => {
    expect(config.root).toBeDefined();
    expect(config.packagesDir).toBeDefined();
    expect(config.packagesDir).toContain('packages');
  });

  it('has templateFilter', () => {
    expect(config.templateFilter).toBe('gasket-template-');
  });

  it('has cleanDirs array', () => {
    expect(config.cleanDirs).toBeDefined();
    expect(Array.isArray(config.cleanDirs)).toBe(true);
    expect(config.cleanDirs).toContain('node_modules');
  });

  it('has npmCiArgs and updateDepsFilter', () => {
    expect(config.npmCiArgs).toBeDefined();
    expect(Array.isArray(config.npmCiArgs)).toBe(true);
    expect(config.updateDepsFilter).toBeDefined();
    expect(typeof config.updateDepsFilter).toBe('string');
  });

  it('has validateDotfiles expectedDotFiles', () => {
    expect(config.validateDotfiles).toBeDefined();
    expect(Array.isArray(config.validateDotfiles.expectedDotFiles)).toBe(true);
  });
});
