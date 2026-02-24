import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

describe('peer-deps', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports no problems and records passed', async () => {
    const runner = mockRunner();
    runner.runCommandCaptureStdout = vi.fn().mockResolvedValue({
      stdout: JSON.stringify({ problems: [] })
    });
    const results = { record: vi.fn() };
    const { handler } = await import('../../src/operations/peer-deps.js');
    await handler([baseTemplate], {
      runner,
      config: baseConfig,
      results,
      flags: {}
    });
    expect(results.record).toHaveBeenCalledWith(baseTemplate.name, 'passed');
  });

  it('reports problems and records failed', async () => {
    const runner = mockRunner();
    runner.runCommandCaptureStdout = vi.fn().mockResolvedValue({
      stdout: JSON.stringify({
        problems: ['missing: react@^18.0.0, required by react-dom@18.2.0']
      })
    });
    const results = { record: vi.fn() };
    const { handler } = await import('../../src/operations/peer-deps.js');
    await handler([baseTemplate], {
      runner,
      config: baseConfig,
      results,
      flags: {}
    });
    expect(results.record).toHaveBeenCalledWith(
      baseTemplate.name,
      'failed',
      '1 peer dep problem(s)'
    );
  });
});
