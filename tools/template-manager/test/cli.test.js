import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseArgv, showUsage } from '../src/cli.js';

describe('cli', () => {
  beforeEach(() => {
    vi.unstubAllEnvs?.();
  });

  describe('parseArgv', () => {
    it('returns operation as first non-flag arg', () => {
      const { operation } = parseArgv(['node', 'template', 'build']);
      expect(operation).toBe('build');
    });

    it('returns null operation when no args', () => {
      const { operation } = parseArgv(['node', 'template']);
      expect(operation).toBeNull();
    });

    it('parses --only as comma-separated list', () => {
      const { flags } = parseArgv(['node', 'template', 'build', '--only=webapp-app,api-express']);
      expect(flags.only).toEqual(['webapp-app', 'api-express']);
    });

    it('trims --only values', () => {
      const { flags } = parseArgv(['node', 'template', 'test', '--only= a , b ']);
      expect(flags.only).toEqual(['a', 'b']);
    });

    it('sets bail true when --bail present', () => {
      const { flags } = parseArgv(['node', 'template', 'lint', '--bail']);
      expect(flags.bail).toBe(true);
    });

    it('sets concurrency to 1 when --no-concurrency present', () => {
      const { flags } = parseArgv(['node', 'template', 'build', '--no-concurrency']);
      expect(flags.concurrency).toBe(1);
    });

    it('parses --concurrency=n', () => {
      const { flags } = parseArgv(['node', 'template', 'build', '--concurrency=4']);
      expect(flags.concurrency).toBe(4);
    });

    it('parses --filter for update-deps', () => {
      const { flags } = parseArgv(['node', 'template', 'update-deps', '--filter=^eslint$']);
      expect(flags.filter).toBe('^eslint$');
    });

    it('parses --pkg for update-deps', () => {
      const { flags } = parseArgv(['node', 'template', 'update-deps', '--pkg=eslint']);
      expect(flags.pkg).toBe('eslint');
    });

    it('operation can be first or after flags', () => {
      const r1 = parseArgv(['node', 'template', 'build', '--bail']);
      expect(r1.operation).toBe('build');
      const r2 = parseArgv(['node', 'template', '--bail', 'build']);
      expect(r2.operation).toBe('build');
    });

    it('default concurrency is number (CPU count)', () => {
      const { flags } = parseArgv(['node', 'template', 'build']);
      expect(typeof flags.concurrency).toBe('number');
      expect(flags.concurrency).toBeGreaterThanOrEqual(1);
    });
  });

  describe('showUsage', () => {
    it('does not throw', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      expect(() => showUsage()).not.toThrow();
      spy.mockRestore();
    });

    it('includes operations and flags in output', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      showUsage();
      const output = spy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('build');
      expect(output).toContain('update-deps');
      expect(output).toContain('--only=');
      expect(output).toContain('--no-concurrency');
      spy.mockRestore();
    });
  });
});
