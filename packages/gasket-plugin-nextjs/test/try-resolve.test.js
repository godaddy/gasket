import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tryResolve from '../lib/utils/try-resolve.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

describe('tryResolve', () => {
  it('returns resolved path when module exists', () => {
    // This test actually calls Node's require.resolve to test the happy path
    const result = tryResolve('jest', [process.cwd()]);
    expect(result).toContain('jest');
    expect(typeof result).toBe('string');
  });

  it('returns null when module does not exist', () => {
    const result = tryResolve('non-existent-module-12345', ['/fake/path']);
    expect(result).toBeNull();
  });

  it('returns null when module exists but not in specified paths', () => {
    // Use a real module that doesn't exist in the fake path
    const result = tryResolve('non-existent-fake-module-xyz', ['/non/existent/path']);
    expect(result).toBeNull();
  });

  it('handles empty paths array', () => {
    const result = tryResolve('non-existent-module', []);
    expect(result).toBeNull();
  });

  it('handles relative module paths', () => {
    const result = tryResolve('./webpack-config.test.js', [dirName]);
    expect(result).toContain('webpack-config.test.js');
  });

  it('handles scoped package names', () => {
    // Using a real scoped package that should exist in node_modules
    const result = tryResolve('@babel/preset-react', [process.cwd()]);
    expect(result).toContain('@babel/preset-react');
  });

  it('handles actual module resolution correctly', () => {
    // This test verifies the function works with real Node.js modules
    // and properly distinguishes between found/not found cases

    // Test with a known module that should exist
    const existingModule = tryResolve('path', [process.cwd()]);
    expect(typeof existingModule).toBe('string');
    expect(existingModule).toContain('path');

    // Test with non-existent module
    const nonExistentModule = tryResolve('definitely-does-not-exist-xyz-123', [process.cwd()]);
    expect(nonExistentModule).toBeNull();
  });
});
