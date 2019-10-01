/**
 * Get the build, start, and local commands
 *
 * @param {Gasket} gasket - Gasket
 * @param {GasketCommand} GasketCommand - Base Gasket command to extend
 * @returns {GasketCommand[]} commands
 */
module.exports = function getCommands(gasket, { GasketCommand }) {

  class BuildCommand extends GasketCommand {
    async gasketRun() {
      await this.gasket.exec('build');
    }
  }
  BuildCommand.id = 'build';
  BuildCommand.description = 'Prepare your app code for deployment';


  class StartCommand extends GasketCommand {
    async gasketRun() {
      await this.gasket.exec('preboot');
      await this.gasket.exec('start');
    }
  }
  StartCommand.id = 'start';
  StartCommand.description = 'Start your app';


  class LocalCommand extends StartCommand {
    async gasketRun() {
      // invoke lifecycle from build command
      await this.gasket.exec('build');
      // invoke lifecycles from start command
      return super.gasketRun();
    }

    async gasketConfigure(gasketConfig) {
      return { ...gasketConfig, env: 'local' };
    }
  }
  LocalCommand.id = 'local';
  LocalCommand.description = 'Build then start your app in local environment';

  return [
    BuildCommand,
    StartCommand,
    LocalCommand
  ];
};
