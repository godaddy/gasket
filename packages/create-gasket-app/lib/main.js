import { fork } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Executes the @gasket/cli passing through the create command and any arguments.
 *
 * @param {string[]} args - create command arguments
 * @returns {ChildProcess} process
 */
export default function main(...args) {
  // import.meta.resolve is not available in Jest without babel transform
  const gasketBin = require.resolve('@gasket/cli/bin/run');

  return fork(
    gasketBin,
    ['create', ...args],
    { stdio: 'inherit', stdin: 'inherit', stderr: 'inherit' }
  );
}
