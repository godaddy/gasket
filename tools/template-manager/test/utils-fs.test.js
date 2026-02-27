import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { rmRecursive, rmFile, readJson, writeJson } from '../src/utils/fs.js';

describe('utils/fs', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `template-test-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe('readJson', () => {
    it('returns parsed object for valid JSON file', () => {
      const filePath = path.join(tmpDir, 'pkg.json');
      fs.writeFileSync(filePath, '{"name":"test","version":"1.0.0"}', 'utf8');
      expect(readJson(filePath)).toEqual({ name: 'test', version: '1.0.0' });
    });

    it('returns null for missing file', () => {
      expect(readJson(path.join(tmpDir, 'missing.json'))).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      const filePath = path.join(tmpDir, 'bad.json');
      fs.writeFileSync(filePath, 'not json', 'utf8');
      expect(readJson(filePath)).toBeNull();
    });
  });

  describe('writeJson', () => {
    it('writes formatted JSON with trailing newline', () => {
      const filePath = path.join(tmpDir, 'out.json');
      writeJson(filePath, { a: 1, b: 2 });
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/\n$/);
      expect(JSON.parse(content)).toEqual({ a: 1, b: 2 });
    });
  });

  describe('rmFile', () => {
    it('removes file and returns true', () => {
      const filePath = path.join(tmpDir, 'f.txt');
      fs.writeFileSync(filePath, 'x', 'utf8');
      const log = vi.fn();
      expect(rmFile(filePath, { log })).toBe(true);
      expect(fs.existsSync(filePath)).toBe(false);
      expect(log).toHaveBeenCalled();
    });

    it('returns false for missing file (ENOENT)', () => {
      const log = vi.fn();
      expect(rmFile(path.join(tmpDir, 'missing'), { log })).toBe(false);
    });
  });

  describe('rmRecursive', () => {
    it('removes directory and returns true', () => {
      const dir = path.join(tmpDir, 'sub');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'f'), 'x', 'utf8');
      const log = vi.fn();
      expect(rmRecursive(dir, { log })).toBe(true);
      expect(fs.existsSync(dir)).toBe(false);
      expect(log).toHaveBeenCalled();
    });
  });
});
