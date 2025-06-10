import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';

describe('postbuild:replace script', () => {
  const testDir = join(process.cwd(), 'test-cjs-temp');

  beforeEach(() => {
    // Create test directory structure
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should replace .js with .cjs in file contents', () => {
    // Create test files with .js references
    const testFile1 = join(testDir, 'index.js');
    const testFile2 = join(testDir, 'nested', 'helper.js');

    mkdirSync(join(testDir, 'nested'), { recursive: true });

    writeFileSync(testFile1, `
const helper = require('./nested/helper.js');
const utils = require('./utils.js');
module.exports = { helper, utils };
    `);

    writeFileSync(testFile2, `
const config = require('../config.js');
const validator = require('./validator.js');
module.exports = { config, validator };
    `);

    // Run the replace command on our test directory
    execSync(`replace '.js' '.cjs' ${testDir} -r`, { stdio: 'inherit' });

    // Verify replacements were made
    const content1 = readFileSync(testFile1, 'utf8');
    const content2 = readFileSync(testFile2, 'utf8');

    expect(content1).toContain("require('./nested/helper.cjs')");
    expect(content1).toContain("require('./utils.cjs')");
    expect(content1).not.toContain("require('./nested/helper.js')");
    expect(content1).not.toContain("require('./utils.js')");

    expect(content2).toContain("require('../config.cjs')");
    expect(content2).toContain("require('./validator.cjs')");
    expect(content2).not.toContain("require('../config.js')");
    expect(content2).not.toContain("require('./validator.js')");
  });

  it('should handle files without .js references', () => {
    const testFile = join(testDir, 'no-js-refs.js');
    const originalContent = `
const path = require('path');
const fs = require('fs');
module.exports = { path, fs };
    `;

    writeFileSync(testFile, originalContent);

    // Run the replace command
    execSync(`replace '.js' '.cjs' ${testDir} -r`, { stdio: 'inherit' });

    // Content should remain unchanged
    const content = readFileSync(testFile, 'utf8');
    expect(content).toBe(originalContent);
  });

  it('should work recursively in nested directories', () => {
    // Create nested directory structure
    const nestedPath = join(testDir, 'level1', 'level2', 'level3');
    mkdirSync(nestedPath, { recursive: true });

    const deepFile = join(nestedPath, 'deep.js');
    writeFileSync(deepFile, `
const shallow = require('../../../shallow.js');
const mid = require('../mid.js');
module.exports = { shallow, mid };
    `);

    // Run the replace command
    execSync(`replace '.js' '.cjs' ${testDir} -r`, { stdio: 'inherit' });

    // Verify deep file was processed
    const content = readFileSync(deepFile, 'utf8');
    expect(content).toContain("require('../../../shallow.cjs')");
    expect(content).toContain("require('../mid.cjs')");
    expect(content).not.toContain('.js');
  });

  it('should handle multiple .js occurrences in same line', () => {
    const testFile = join(testDir, 'multiple.js');
    writeFileSync(testFile, `
const a = require('./a.js'), b = require('./b.js');
const multiline = require('./c.js') || require('./d.js');
    `);

    // Run the replace command
    execSync(`replace '.js' '.cjs' ${testDir} -r`, { stdio: 'inherit' });

    const content = readFileSync(testFile, 'utf8');
    expect(content).toContain("require('./a.cjs'), b = require('./b.cjs')");
    expect(content).toContain("require('./c.cjs') || require('./d.cjs')");
    expect(content).not.toContain('.js');
  });
});
