import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createResults } from '../src/results.js';

describe('results', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('records passed and hasFailures returns false', () => {
    const results = createResults('build');
    results.record('tpl-a', 'passed');
    results.record('tpl-b', 'passed');
    expect(results.hasFailures()).toBe(false);
  });

  it('records failed and hasFailures returns true', () => {
    const results = createResults('test');
    results.record('tpl-a', 'passed');
    results.record('tpl-b', 'failed', 'exit code 1');
    expect(results.hasFailures()).toBe(true);
  });

  it('skipped does not count as failure', () => {
    const results = createResults('lint');
    results.record('tpl-a', 'skipped', 'filtered');
    expect(results.hasFailures()).toBe(false);
  });

  it('summary prints counts and entries', () => {
    const results = createResults('build');
    results.record('tpl-a', 'passed');
    results.record('tpl-b', 'failed', 'err');
    results.record('tpl-c', 'skipped');
    results.summary();
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toMatch(/1 passed.*1 failed.*1 skipped/);
    expect(output).toContain('tpl-a');
    expect(output).toContain('tpl-b');
    expect(output).toContain('tpl-c');
  });
});
