const assume = require('assume');
const AbortController = require('abort-controller');
const runShellCommand = require('../lib/run-shell-command');

const cwd = __dirname;
const failMode = true;

const pause = ms => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

describe('runShellCommand', function () {
  it('returns a promise', async function () {
    const promise = runShellCommand('node', ['./fixtures/test-script.js'], { cwd });
    assume(promise).is.instanceof(Promise);
  });

  it('resolves object with stdout', async function () {
    const results = await runShellCommand('node', ['./fixtures/test-script.js'], { cwd });
    assume(results).is.instanceof(Object);
    assume(results).property('stdout');
    assume(results.stdout).includes('waiting');
    assume(results.stdout).includes('success');
  });

  it('rejects for non-zero exits', async function () {
    const promise = runShellCommand('node', ['./fixtures/test-script.js', failMode], { cwd });
    await assume(promise).throwsAsync();
  });

  it('rejects with details object', async function () {
    try {
      await runShellCommand('node', ['./fixtures/test-script.js', failMode], { cwd });
    } catch (err) {
      assume(err).is.instanceof(Object);
      assume(err).property('message');
      assume(err.message).includes('exited with non-zero code');

      assume(err).property('argv');
      assume(err).property('stdout');
      assume(err.stdout).includes('waiting');

      assume(err).property('stderr');
      assume(err.stderr).includes('fail');

      assume(err).property('code', 1);
      assume(err).property('aborted', false);
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
      await assume(promise).not.throwsAsync();
    });

    it('early abort rejects before run', async function () {
      controller.abort();
      const promise = runShellCommand('node', ['./fixtures/test-script.js'], { cwd, signal });
      await assume(promise).throwsAsync();
    });

    it('early abort rejects with details object', async function () {
      controller.abort();
      try {
        await runShellCommand('node', ['./fixtures/test-script.js'], { cwd, signal });
      } catch (err) {
        assume(err).is.instanceof(Object);
        assume(err).property('message');
        assume(err.message).includes('aborted');

        assume(err).property('argv');
        assume(err).not.property('stdout');
        assume(err).not.property('stderr');
        assume(err).property('aborted', true);
      }
    });

    it('abort rejects after run', async function () {
      const promise = runShellCommand('node', ['./fixtures/test-script.js', !failMode, 100], { cwd, signal });
      await pause(10);
      controller.abort();
      await assume(promise).throwsAsync();
    });

    it('abort rejects with details object', async function () {
      try {
        const promise = runShellCommand('node', ['./fixtures/test-script.js', !failMode, 100], { cwd, signal });
        await pause(10);
        controller.abort();
        await promise;
      } catch (err) {
        assume(err).is.instanceof(Object);
        assume(err).property('message');
        assume(err.message).includes('exited with non-zero code');

        assume(err).property('argv');
        assume(err).property('stdout');
        assume(err).property('stderr');
        assume(err).property('code');

        assume(err).property('aborted', true);
      }
    }, 'early abort rejects with details object');
  });
});
