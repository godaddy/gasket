import { vi, describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import { readFile } from 'fs/promises';
import { tryImport } from '../lib/utils';

// Mock the modules
vi.mock('fs/promises');
vi.mock('path');

describe('utils', () => {
  describe('tryImport', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      path.resolve = vi.fn(p => `/resolved/${p}`);
    });

    it('resolves path and returns content for JSON files', async () => {
      const mockContent = { name: 'test-package' };
      readFile.mockResolvedValue(JSON.stringify(mockContent));

      const result = await tryImport('/path/to/package.json');

      expect(result).toEqual(mockContent);
    });

    it('returns null for non-existent JSON files', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      readFile.mockRejectedValue(error);

      const result = await tryImport('/path/to/non-existent.json');

      expect(result).toBeNull();
    });

    it('returns null for non-existent JS modules', async () => {
      const error = new Error('Module not found');
      error.code = 'MODULE_NOT_FOUND';
      readFile.mockRejectedValue(error);

      const result = await tryImport('/path/to/non-existent.js');

      expect(result).toBeNull();
    });

    it('returns null for non-existent modules with ERR_MODULE_NOT_FOUND', async () => {
      const error = new Error('Module not found');
      error.code = 'ERR_MODULE_NOT_FOUND';
      readFile.mockRejectedValue(error);

      const result = await tryImport('/path/to/non-existent.js');

      expect(result).toBeNull();
    });

    it('propagates unexpected errors', async () => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      readFile.mockRejectedValue(error);

      await expect(tryImport('/path/to/error.json')).rejects.toThrow('Permission denied');
    });
  });
});
