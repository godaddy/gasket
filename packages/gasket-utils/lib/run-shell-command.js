const concat = require('concat-stream');
const spawn = require('cross-spawn');

/**
 * Promise friendly wrapper to running a shell command (eg: git, npm, ls)
 * which passes back any { stdout, stderr } to the error thrown.
 *
 * Options can be passed to the underlying spawn. An additional `signal` option
 * can be passed to use AbortController, allowing processes to be killed when
 * no longer needed.
 *
 * @example
 * const { runShellCommand } = require('@gasket/utils');
 *
 *  async function helloWorld() {
 *   await runShellCommand('echo', ['hello world']);
 * }
 *
 * @example
 * // With timeout using AbortController
 *
 * const { runShellCommand } = require('@gasket/utils');
 * const AbortController = require('abort-controller');
 *
 *  async function helloWorld() {
 *   const controller = new AbortController();
 *   // abort the process after 60 seconds
 *   const id = setTimeout(() => controller.abort(), 60000);
 *   await runShellCommand('long-process', ['something'], { signal: controller.signal });
 *   clearTimeout(id);
 * }
 *
 * @param {string} cmd Binary that is run
 * @param {array} argv Arguments passed to npm binary through spawn.
 * @param {object} options Options passed to npm binary through spawn
 * @param {object} [options.signal] AbortControl signal allowing process to be canceled
 * @param {boolean} [debug] When present pipes std{out,err} to process.*
 * @returns {Promise} A promise represents if command succeeds or fails.
 * @public
 */
function runShellCommand(cmd, argv, options = {}, debug = false) {
  const { signal, ...opts } = options;

  if (signal && signal.aborted) {
    return Promise.reject(Object.assign(new Error(`${ cmd } was aborted before spawn`), { argv, aborted: true }));
  }

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, opts);

    let stderr;
    let stdout;

    child.stderr.pipe(concat({ encoding: 'string' }, lines => {
      stderr = lines;
    }));

    child.stdout.pipe(concat({ encoding: 'string' }, lines => {
      stdout = lines;
    }));

    if (debug) {
      child.stderr.pipe(process.stderr);
      child.stdout.pipe(process.stdout);
    }

    let aborted = false;
    if (signal) {
      signal.addEventListener('abort', () => {
        aborted = true;
        child.kill();
      });
    }

    child.on('close', code => {
      if (code !== 0) {
        return reject(Object.assign(new Error(`${ cmd } exited with non-zero code`), {
          argv,
          stdout,
          stderr,
          aborted,
          code
        }));
      }

      resolve({ stdout });
    });
  });
}

module.exports = runShellCommand;
