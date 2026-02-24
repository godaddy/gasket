import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseConfig } from '../helpers.js';

const templates = [
  {
    name: 'gasket-template-a',
    templateDir: '/repo/packages/gasket-template-a/template',
    packageDir: '/repo/packages/gasket-template-a',
    hasPackageJson: true
  },
  {
    name: 'gasket-template-b',
    templateDir: '/repo/packages/gasket-template-b/template',
    packageDir: '/repo/packages/gasket-template-b',
    hasPackageJson: true
  }
];

describe('audit', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aggregates vulnerabilities across templates', async () => {
    const runner = mockRunner();
    runner.runCommandCaptureStdout
      .mockResolvedValueOnce({
        code: 0,
        stdout: JSON.stringify({
          vulnerabilities: {
            lodash: { severity: 'high', via: [{ title: 'Prototype Pollution' }] }
          }
        })
      })
      .mockResolvedValueOnce({
        code: 0,
        stdout: JSON.stringify({
          vulnerabilities: {
            lodash: { severity: 'high', via: [{ title: 'Prototype Pollution' }] }
          }
        })
      });

    const { handler } = await import('../../src/operations/audit.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner, config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('HIGH');
    expect(output).toContain('Prototype Pollution');
    expect(output).toContain('gasket-template-a');
    expect(output).toContain('gasket-template-b');
    expect(results.record).toHaveBeenCalledWith('gasket-template-a', 'passed');
    consoleSpy.mockRestore();
  });

  it('deduplicates same vulnerability across templates', async () => {
    const runner = mockRunner();
    const auditData = JSON.stringify({
      vulnerabilities: {
        semver: { severity: 'moderate', via: [{ title: 'ReDoS' }] }
      }
    });
    runner.runCommandCaptureStdout
      .mockResolvedValueOnce({ code: 0, stdout: auditData })
      .mockResolvedValueOnce({ code: 0, stdout: auditData });

    const { handler } = await import('../../src/operations/audit.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner, config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    const reDoSMatches = (output.match(/ReDoS/g) || []).length;
    expect(reDoSMatches).toBe(1);
    consoleSpy.mockRestore();
  });

  it('reports no vulnerabilities when clean', async () => {
    const runner = mockRunner();
    runner.runCommandCaptureStdout.mockResolvedValue({
      code: 0,
      stdout: JSON.stringify({ vulnerabilities: {} })
    });

    const { handler } = await import('../../src/operations/audit.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner, config: baseConfig, results });

    const output = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('No known vulnerabilities');
    consoleSpy.mockRestore();
  });

  it('handles npm audit failure gracefully', async () => {
    const runner = mockRunner();
    runner.runCommandCaptureStdout.mockResolvedValue({ code: 1, stdout: '' });

    const { handler } = await import('../../src/operations/audit.js');
    const results = { record: vi.fn() };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler(templates, { runner, config: baseConfig, results });

    expect(results.record).toHaveBeenCalledWith('gasket-template-a', 'passed');
    consoleSpy.mockRestore();
  });
});
