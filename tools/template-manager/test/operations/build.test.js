import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

describe('build', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls runner.runCommand with npm run build', async () => {
    const { handler } = await import('../../src/operations/build.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });
    expect(runner.runCommand).toHaveBeenCalledTimes(1);
    expect(runner.runCommand).toHaveBeenCalledWith('npm', ['run', 'build'], baseTemplate.templateDir);
  });
});
