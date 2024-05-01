/// <reference types="@gasket/cli" />

const { runShellCommand } = require('@gasket/utils');

/**
 * Initializes the app with a git repo and creates a first commit with generated
 * files
 */
module.exports = {
  timing: {
    last: true
  },
  /** @type {import('@gasket/engine').HookHandler<'postCreate'>} */
  handler: async function postCreateHook(gasket, context) {
    const { gitInit, dest: cwd } = context;

    if (gitInit) {
      // Init a git repo
      await runShellCommand('git', ['init'], { cwd });

      // Use `main` branch
      await runShellCommand('git', ['checkout', '-b', 'main'], { cwd });

      // Add all files
      await runShellCommand('git', ['add', '.'], { cwd });

      // Create a commit
      await runShellCommand(
        'git',
        ['commit', '-m', ':tada: Created new repository with gasket create'],
        { cwd }
      );
    }
  }
};
