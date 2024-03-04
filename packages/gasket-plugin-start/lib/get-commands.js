/**
 * Get the build, start, and local commands
 *
 * @param {Gasket} gasket - Gasket
 * @param {GasketCommand} GasketCommand - Base Gasket command to extend
 * @param {Object} flags - oclif flags utility
 * @returns {GasketCommand[]} commands
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
    action: async function ({ NoExit }) {
      await gasket.exec('build');
      if (!NoExit) {
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
