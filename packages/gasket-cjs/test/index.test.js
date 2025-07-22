import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { transpile, transpileFile, fixImportExtensions } from '../lib/index.js';
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('gasket-cjs', () => {
  const testDir = './test-output';
  const sourceDir = join(testDir, 'src');
  const outputDir = join(testDir, 'cjs');

  beforeEach(() => {
    // Clean up any existing test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }

    // Create test directory structure
    mkdirSync(sourceDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('transpileFile', () => {
    it('should transpile a single ESM file to CJS', async () => {
      const inputFile = join(sourceDir, 'test.js');
      const outputFile = join(outputDir, 'test.cjs');

      // Create test ESM file
      writeFileSync(inputFile, 'export const greeting = "Hello World";');

      const result = await transpileFile(inputFile, outputFile);

      expect(result.success).toBe(true);
      expect(result.inputPath).toBe(inputFile);
      expect(result.outputPath).toBe(outputFile);
      expect(existsSync(outputFile)).toBe(true);

      const content = readFileSync(outputFile, 'utf-8');
      expect(content).toContain('exports');
      expect(content).toContain('Hello World');
    });

    it('should handle transpilation errors gracefully', async () => {
      const inputFile = join(sourceDir, 'invalid.js');
      const outputFile = join(outputDir, 'invalid.cjs');

      // Create invalid JavaScript file
      writeFileSync(inputFile, 'invalid syntax here !!!');

      const result = await transpileFile(inputFile, outputFile);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('transpile', () => {
    it('should transpile multiple files in a directory', async () => {
      // Create test files
      writeFileSync(join(sourceDir, 'file1.js'), 'export const a = 1;');
      writeFileSync(join(sourceDir, 'file2.js'), 'export const b = 2;');

      const result = await transpile(sourceDir, outputDir);

      expect(result.successful.length).toBe(2);
      expect(result.failed.length).toBe(0);
      expect(result.total).toBe(2);
      expect(existsSync(join(outputDir, 'file1.cjs'))).toBe(true);
      expect(existsSync(join(outputDir, 'file2.cjs'))).toBe(true);
      expect(existsSync(join(outputDir, 'package.json'))).toBe(true);
    });

    it('should fix import extensions', async () => {
      // Create test file with import
      writeFileSync(join(sourceDir, 'importer.js'), 'import { helper } from "./helper.js";');

      await transpile(sourceDir, outputDir);

      const content = readFileSync(join(outputDir, 'importer.cjs'), 'utf-8');
      expect(content).toContain('./helper.cjs');
      expect(content).not.toContain('./helper.js');
    });

    it('should handle progress callback', async () => {
      const progressCalls = [];

      writeFileSync(join(sourceDir, 'test.js'), 'export const test = true;');

      await transpile(sourceDir, outputDir, {
        onProgress: (progress) => {
          progressCalls.push(progress);
        }
      });

      expect(progressCalls.length).toBe(1);
      expect(progressCalls[0]).toHaveProperty('current', 1);
      expect(progressCalls[0]).toHaveProperty('total', 1);
    });
  });

  describe('fixImportExtensions', () => {
    const testFile = join(outputDir, 'test.cjs');

    beforeEach(() => {
      mkdirSync(outputDir, { recursive: true });
    });

    it('should fix .js extensions to .cjs', async () => {
      writeFileSync(testFile, 'const helper = require("./helper.js");');

      await fixImportExtensions(outputDir);

      const content = readFileSync(testFile, 'utf-8');
      expect(content).toContain('./helper.cjs');
      expect(content).not.toContain('./helper.js');
    });

    it('replaces local .js and .mjs imports with .cjs (double quotes only)', async () => {
      const code = `
        const a = require("./foo.js");
        import b from "../bar.mjs";
        import c from "/baz.js";
      `;
      writeFileSync(testFile, code, 'utf-8');

      await fixImportExtensions(outputDir);

      const result = readFileSync(testFile, 'utf-8');
      expect(result).toContain('require("./foo.cjs")');
      expect(result).toContain('import b from "../bar.cjs"');
      expect(result).toContain('import c from "/baz.cjs"');
    });

    it('does not replace bare imports or single-quoted paths', async () => {
      const code = `
        const d = require('next/document.js');
        import e from 'next/foo.mjs';
        import f from 'react.js';
      `;
      writeFileSync(testFile, code, 'utf-8');

      await fixImportExtensions(outputDir);

      const result = readFileSync(testFile, 'utf-8');
      expect(result).toContain("require('next/document.js')");
      expect(result).toContain("import e from 'next/foo.mjs'");
      expect(result).toContain("import f from 'react.js'");
    });

    it('does not replace imports without .js/.mjs extension', async () => {
      const code = `
        import g from "./foo";
        const h = require("../bar");
      `;
      writeFileSync(testFile, code, 'utf-8');

      await fixImportExtensions(outputDir);

      const result = readFileSync(testFile, 'utf-8');
      expect(result).toContain('import g from "./foo"');
      expect(result).toContain('require("../bar")');
    });
  });
});
