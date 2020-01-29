const concat = require('concat-stream');
const spawn = require('cross-spawn');

/**
 * Promise friendly wrapper to running a shell command (eg: git, npm, ls)
 * which passes back any { stdout, stderr } to the error thrown.
 *
 * @example
 * const { runShellCommand } = require('@gasket/utils');
 *
 *  async function helloWorld() {
 *   await runShellCommand('echo', ['hello world']);
 * }
 *
 * @param {string} cmd binary that is run
 * @param {array} argv args passed to npm binary through spawn.
 * @param {object} options options passed to npm binary through spawn
 * @param {boolean} [debug] When present pipes std{out,err} to process.*
 * @returns {Promise} A promise represents if npm succeeds or fails.
 * @public
 */
function runShellCommand(cmd, argv, options, debug) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, options);

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

    child.on('close', code => {
      if (code !== 0) {
        return reject(Object.assign(new Error(`${cmd} exited with non-zero code`), {
          argv,
          stdout,
          stderr
        }));
      }

      resolve({ stdout });
    });
  });
}

module.exports = runShellCommand;
