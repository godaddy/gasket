import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

describe('test operation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls runner.runCommand with npm test and config env', async () => {
    const { handler } = await import('../../src/operations/test.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });
    expect(runner.runCommand).toHaveBeenCalledTimes(1);
    expect(runner.runCommand).toHaveBeenCalledWith('npm', ['test'], baseTemplate.templateDir, baseConfig.testEnv);
  });
});
