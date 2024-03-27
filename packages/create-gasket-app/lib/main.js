const { fork } = require('child_process');

/**
 * Executes the @gasket/cli passing through the create command and any arguments.
 *
 * @param {string[]} args - create command arguments
 * @returns {ChildProcess} process
 */
function main(...args) {
  const gasketBin = require.resolve('@gasket/cli/bin/run');

  return fork(
    gasketBin,
    ['create', ...args],
    { stdio: 'inherit', stdin: 'inherit', stderr: 'inherit' }
  );
}

module.exports = main;
