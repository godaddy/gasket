import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

describe('lint', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls runner.runCommand with npx eslint args', async () => {
    const { handler } = await import('../../src/operations/lint.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });
    expect(runner.runCommand).toHaveBeenCalledTimes(1);
    expect(runner.runCommand).toHaveBeenCalledWith(
      'npx',
      ['eslint', '--ext', '.js,.jsx,.cjs,.ts,.tsx', '.'],
      baseTemplate.templateDir,
      baseConfig.lintEnv
    );
  });
});
