/**
 * Command runner factory.
 * Creates a runner that wraps process utilities with optional logging.
 * The runner is passed to operations via the context object.
 */

import * as processUtils from './utils/process.js';

/**
 * Create a command runner.
 * @param {function} [log] - Optional logging function
 * @returns {object} Runner with runCommand, runCommandCaptureStderr, runCommandCaptureStdout
 * @example
 *   const runner = createRunner(msg => console.log(msg));
 *   await runner.runCommand('npm', ['install'], '/path/to/dir');
 */
export function createRunner(log = () => {}) {
  return {
    /**
     * Run command with inherited stdio. Rejects on non-zero exit.
     */
    runCommand(command, args, cwd, customEnv = {}) {
      return processUtils.runCommand(command, args, cwd, { customEnv, log });
    },

    /**
     * Run command with captured stderr. Resolves with { code, stderr }.
     */
    runCommandCaptureStderr(command, args, cwd, customEnv = {}) {
      return processUtils.runCommandCaptureStderr(command, args, cwd, { customEnv, log });
    },

    /**
     * Run command with captured stdout. Resolves with { code, stdout }.
     */
    runCommandCaptureStdout(command, args, cwd, customEnv = {}) {
      return processUtils.runCommandCaptureStdout(command, args, cwd, { customEnv, log });
    }
  };
}
