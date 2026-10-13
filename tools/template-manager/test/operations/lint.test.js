import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

describe('lint', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("runs the template's npm lint script with no forced env", async () => {
    const { handler } = await import('../../src/operations/lint.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });
    expect(runner.runCommand).toHaveBeenCalledTimes(1);
    expect(runner.runCommand).toHaveBeenCalledWith('npm', ['run', 'lint'], baseTemplate.templateDir, {});
  });

  it('passes config.lintEnv through when set', async () => {
    const { handler } = await import('../../src/operations/lint.js');
    const runner = mockRunner();
    const lintEnv = { FOO: 'bar' };
    await handler(baseTemplate, { runner, config: { ...baseConfig, lintEnv }, flags: {} });
    expect(runner.runCommand).toHaveBeenCalledWith('npm', ['run', 'lint'], baseTemplate.templateDir, lintEnv);
  });
});
