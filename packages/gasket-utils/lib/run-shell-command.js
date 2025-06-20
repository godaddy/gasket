/* eslint-disable max-params */
import spawn from 'cross-spawn';
import concat from 'concat-stream';

/** @type {import('./index.js').runShellCommand} */
function runShellCommand(cmd, argv, options = {}, debug = false) {
  const { signal, ...opts } = options;
  /** @type {string} */
  let stderr;
  /** @type {string} */
  let stdout;

  if (signal && signal.aborted) {
    return Promise.reject(
      Object.assign(new Error(`${cmd} was aborted before spawn`), {
        argv,
        aborted: true
      })
    );
  }

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, opts);

    child.stderr.pipe(
      concat({ encoding: 'string' }, (lines) => {
        stderr = lines;
      })
    );

    child.stdout.pipe(
      concat({ encoding: 'string' }, (lines) => {
        stdout = lines;
      })
    );

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

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(
          Object.assign(new Error(`${cmd} exited with non-zero code`), {
            argv,
            stdout,
            stderr,
            aborted,
            code
          })
        );
      }

      resolve({ stdout });
    });
  });
}

export default runShellCommand;
