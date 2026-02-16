import { expect, describe, it, beforeEach } from 'vitest';
import AbortController from 'abort-controller';

// Import the module - dynamic import is needed for ESM
const runShellCommand = (await import('../lib/run-shell-command.js')).default;

// ESM doesn't have __dirname, so we need to calculate it
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const cwd = dirName;
const failMode = true;

const pause = ms => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

describe('runShellCommand', function () {
  it('returns a promise', async function () {
    const promise = runShellCommand('node', ['./fixtures/test-script.js'], { cwd });
    expect(promise).toBeInstanceOf(Promise);
  });

  it('resolves object with stdout', async function () {
    const results = await runShellCommand('node', ['./fixtures/test-script.js'], { cwd });
    expect(results).toBeInstanceOf(Object);
    expect(results).toHaveProperty('stdout');
    expect(results.stdout).toContain('waiting');
    expect(results.stdout).toContain('success');
  });

  it('rejects for non-zero exits', async function () {
    const promise = runShellCommand('node', ['./fixtures/test-script.js', failMode], { cwd });
    await expect(promise).rejects.toThrow();
  });

  it('rejects with details object', async function () {

    try {
      await runShellCommand('node', ['./fixtures/test-script.js', failMode], { cwd });
    } catch (err) {
      expect(err).toBeInstanceOf(Object);
      expect(err).toHaveProperty('message');
      expect(err.message).toContain('exited with non-zero code');

      expect(err).toHaveProperty('argv');
      expect(err).toHaveProperty('stdout');
      expect(err.stdout).toContain('waiting');

      expect(err).toHaveProperty('stderr');
      expect(err.stderr).toContain('fail');

      expect(err).toHaveProperty('code', 1);
      expect(err).toHaveProperty('aborted', false);
    }
  });

  describe('with AbortController', function () {
    let controller, signal;
    beforeEach(function () {
      controller = new AbortController();
      signal = controller.signal;
    });

    it('returns a promise', async function () {
      const promise = runShellCommand('node', ['./fixtures/test-script.js'], { cwd, signal });
      await expect(promise).resolves.not.toThrow();
    });

    it('early abort rejects before run', async function () {
      controller.abort();
      const promise = runShellCommand('node', ['./fixtures/test-script.js'], { cwd, signal });
      await expect(promise).rejects.toThrow();
    });

    it('early abort rejects with details object', async function () {
      controller.abort();
      try {
        await runShellCommand('node', ['./fixtures/test-script.js'], { cwd, signal });
      } catch (err) {
        expect(err).toBeInstanceOf(Object);
        expect(err).toHaveProperty('message');
        expect(err.message).toContain('aborted');

        expect(err).toHaveProperty('argv');
        expect(err).not.toHaveProperty('stdout');
        expect(err).not.toHaveProperty('stderr');
        expect(err).toHaveProperty('aborted', true);
      }
    });

    it('abort rejects after run', async function () {
      const promise = runShellCommand('node', ['./fixtures/test-script.js', !failMode, 100], { cwd, signal });
      await pause(10);
      controller.abort();
      await expect(promise).rejects.toThrow();
    });

    it('abort rejects with details object', async function () {
      try {
        const promise = runShellCommand('node', ['./fixtures/test-script.js', !failMode, 100], { cwd, signal });
        await pause(10);
        controller.abort();
        await promise;
      } catch (err) {
        expect(err).toBeInstanceOf(Object);
        expect(err).toHaveProperty('message');
        expect(err.message).toContain('exited with non-zero code');

        expect(err).toHaveProperty('argv');
        expect(err).toHaveProperty('stdout');
        expect(err).toHaveProperty('stderr');
        expect(err).toHaveProperty('code');

        expect(err).toHaveProperty('aborted', true);
      }
    });
  });
});
