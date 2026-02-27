import { describe, it, expect } from 'vitest';
import { createRunner } from '../src/runner.js';

describe('runner', () => {
  it('createRunner returns object with runCommand and runCommandCaptureStderr', () => {
    const runner = createRunner();
    expect(runner).toHaveProperty('runCommand');
    expect(runner).toHaveProperty('runCommandCaptureStderr');
    expect(typeof runner.runCommand).toBe('function');
    expect(typeof runner.runCommandCaptureStderr).toBe('function');
  });

  it('accepts optional log function', () => {
    const log = () => {};
    const runner = createRunner(log);
    expect(runner.runCommand).toBeDefined();
  });
});
