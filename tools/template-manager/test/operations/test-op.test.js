import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

vi.mock('fs');

describe('test operation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls runner.runCommand with npm test and legacy env when no eslint.config.js', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const { handler } = await import('../../src/operations/test.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });
    expect(runner.runCommand).toHaveBeenCalledTimes(1);
    expect(runner.runCommand).toHaveBeenCalledWith('npm', ['test'], baseTemplate.templateDir, baseConfig.testEnv);
  });

  it('calls runner.runCommand with no forced env when eslint.config.js exists', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('eslint.config.js'));
    const { handler } = await import('../../src/operations/test.js');
    const runner = mockRunner();
    await handler(baseTemplate, { runner, config: baseConfig, flags: {} });
    expect(runner.runCommand).toHaveBeenCalledWith('npm', ['test'], baseTemplate.templateDir, {});
  });
});
