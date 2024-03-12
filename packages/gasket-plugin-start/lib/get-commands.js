/* eslint-disable spaced-comment */
/// <reference types="@gasket/cli" />
/**
 * Get the build, start, and local commands
 *
 * @param {Gasket} gasket - Gasket
 * @returns {CLICommand[]} commands
 */
module.exports = function getCommands(gasket) {
  const BuildCommand = {
    id: 'build',
    description: 'Prepare your app',
    options: [
      {
        name: 'no-exit',
        description: 'Exit process immediately after command completes',
        type: 'boolean',
        default: false
      }
    ],
    action: async function ({ exit }) {
      await gasket.exec('build');
      if (!exit) {
        gasket.logger.debug('force exit');
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      }
    }
  };

  const StartCommand = {
    id: 'start',
    description: 'Start your app',
    options: [
      {
        name: 'env',
        description: 'Target runtime environment',
        default: 'local'
      }
    ],
    action: async function () {
      await gasket.exec('preboot');
      await gasket.exec('start');
    }
  };


  const LocalCommand = {
    id: 'local',
    description: 'Build then start your app in local environment',
    options: [
      {
        name: 'env',
        description: 'Target runtime environment',
        default: 'local'
      }
    ],
    action: async function () {
      // invoke lifecycle from build command
      await gasket.exec('build');
      // invoke lifecycles from start command
      await gasket.exec('start');
    }
  };

  return [
    BuildCommand,
    StartCommand,
    LocalCommand
  ];
};
