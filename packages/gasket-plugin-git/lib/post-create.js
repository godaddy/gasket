const { runShellCommand } = require('@gasket/utils');

/**
 * Initialize the app with a git repo and creates a first commit with generated files
 *
 * @param {Gasket} gasket - Gasket
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
module.exports = {
  timing: {
    last: true
  },
  handler: async function postCreateHook(gasket, context) {
    const { gitInit, dest: cwd } = context;

    if (gitInit) {
      // Init a git repo
      await runShellCommand('git', ['init'], { cwd });

      // Add all files
      await runShellCommand('git', ['add', '.'], { cwd });

      // Create a commit
      await runShellCommand('git', ['commit', '-m', ':tada: Created new repository with gasket create'], { cwd });
    }
  }
};

