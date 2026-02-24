/**
 * Process spawn utilities.
 *
 * Provides command execution with various stdio configurations.
 * Automatically adds local node_modules/.bin to PATH.
 */

import path from 'path';
import { spawn } from 'child_process';

/**
 * Run a command with inherited stdio.
 * Rejects if exit code is non-zero.
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {string} cwd - Working directory
 * @param {object} [options] - Options
 * @param {object} [options.customEnv] - Additional environment variables
 * @param {function} [options.log] - Logging function
 * @returns {Promise<void>}
 */
export function runCommand(command, args, cwd, options = {}) {
  const { customEnv = {}, log = () => {} } = options;
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')} in ${cwd}`);

    const localBin = path.join(cwd, 'node_modules', '.bin');
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        PATH: `${localBin}${path.delimiter}${process.env.PATH}`,
        ...customEnv
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

/**
 * Run a command with stderr captured.
 * Always resolves with { code, stderr }.
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {string} cwd - Working directory
 * @param {object} [options] - Options
 * @param {object} [options.customEnv] - Additional environment variables
 * @param {function} [options.log] - Logging function
 * @returns {Promise<{ code: number, stderr: string }>}
 */
export function runCommandCaptureStderr(command, args, cwd, options = {}) {
  const { customEnv = {}, log = () => {} } = options;
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')} in ${cwd}`);

    const localBin = path.join(cwd, 'node_modules', '.bin');
    const child = spawn(command, args, {
      cwd,
      stdio: ['inherit', 'inherit', 'pipe'],
      shell: false,
      env: {
        ...process.env,
        PATH: `${localBin}${path.delimiter}${process.env.PATH}`,
        ...customEnv
      }
    });

    const stderrChunks = [];
    child.stderr?.on('data', (chunk) => stderrChunks.push(chunk));

    child.on('close', (code) => {
      const stderr = Buffer.concat(stderrChunks).toString('utf8');
      resolve({ code: code ?? 1, stderr });
    });

    child.on('error', reject);
  });
}

/**
 * Run a command with stdout captured.
 * Always resolves with { code, stdout }.
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {string} cwd - Working directory
 * @param {object} [options] - Options
 * @param {object} [options.customEnv] - Additional environment variables
 * @param {function} [options.log] - Logging function
 * @returns {Promise<{ code: number, stdout: string }>}
 */
export function runCommandCaptureStdout(command, args, cwd, options = {}) {
  const { customEnv = {}, log = () => {} } = options;
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')} in ${cwd}`);

    const localBin = path.join(cwd, 'node_modules', '.bin');
    const child = spawn(command, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: false,
      env: {
        ...process.env,
        PATH: `${localBin}${path.delimiter}${process.env.PATH}`,
        ...customEnv
      }
    });

    const stdoutChunks = [];
    child.stdout?.on('data', (chunk) => stdoutChunks.push(chunk));

    child.on('close', (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString('utf8');
      resolve({ code: code ?? 1, stdout });
    });

    child.on('error', reject);
  });
}
