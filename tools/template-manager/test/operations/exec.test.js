import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRunner, baseTemplate, baseConfig } from '../helpers.js';

describe('exec', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('runs command via sh -c in template directory', async () => {
    const runner = mockRunner();
    const { handler } = await import('../../src/operations/exec.js');

    await handler(baseTemplate, {
      runner,
      config: baseConfig,
      flags: { positional: ['npx', 'next', 'lint'] }
    });

    expect(runner.runCommand).toHaveBeenCalledWith(
      'sh',
      ['-c', 'npx next lint'],
      baseTemplate.templateDir
    );
  });

  it('joins positional args with space', async () => {
    const runner = mockRunner();
    const { handler } = await import('../../src/operations/exec.js');

    await handler(baseTemplate, {
      runner,
      config: baseConfig,
      flags: { positional: ['echo', 'hello', 'world'] }
    });

    expect(runner.runCommand).toHaveBeenCalledWith(
      'sh',
      ['-c', 'echo hello world'],
      baseTemplate.templateDir
    );
  });

  it('handles quoted command as single arg', async () => {
    const runner = mockRunner();
    const { handler } = await import('../../src/operations/exec.js');

    await handler(baseTemplate, {
      runner,
      config: baseConfig,
      flags: { positional: ['npm run build && npm test'] }
    });

    expect(runner.runCommand).toHaveBeenCalledWith(
      'sh',
      ['-c', 'npm run build && npm test'],
      baseTemplate.templateDir
    );
  });

  it('throws when no command provided', async () => {
    const { handler } = await import('../../src/operations/exec.js');

    await expect(handler(baseTemplate, {
      runner: mockRunner(),
      config: baseConfig,
      flags: { positional: [] }
    })).rejects.toThrow('Usage: exec <command>');
  });

  it('throws when positional is undefined', async () => {
    const { handler } = await import('../../src/operations/exec.js');

    await expect(handler(baseTemplate, {
      runner: mockRunner(),
      config: baseConfig,
      flags: {}
    })).rejects.toThrow('Usage: exec <command>');
  });

  it('propagates runner errors', async () => {
    const runner = mockRunner();
    runner.runCommand.mockRejectedValue(new Error('Command failed with code 1'));

    const { handler } = await import('../../src/operations/exec.js');

    await expect(handler(baseTemplate, {
      runner,
      config: baseConfig,
      flags: { positional: ['false'] }
    })).rejects.toThrow('Command failed with code 1');
  });
});
