/**
 * Get the build, start, and local commands
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} GasketCommand - Base Gasket command to extend
 * @returns {GasketCommand[]} commands
 */
module.exports = function getCommands(gasket, { GasketCommand }) {

  class BuildCommand extends GasketCommand {
    async runHooks() {
      await this.gasket.exec('build');
    }
  }
  BuildCommand.id = 'build';
  BuildCommand.description = 'Prepare your app code for deployment';


  class StartCommand extends GasketCommand {
    async runHooks() {
      await this.gasket.exec('preboot');
      await this.gasket.exec('start');
    }
  }
  StartCommand.id = 'start';
  StartCommand.description = 'Start your app';


  class LocalCommand extends StartCommand {
    async configure(gasketConfig) {
      this.flags = {
        ...this.flags,
        env: 'local'
      };
      gasketConfig.env = 'local';
      return super.configure(gasketConfig);
    }

    async runHooks() {
      //
      // invoke lifecycles from build command
      //
      await this.gasket.exec('build');

      //
      // invoke lifecycles from start command
      //
      return super.runHooks();
    }
  }
  LocalCommand.id = 'local';
  LocalCommand.description = 'Build then start your app in dev mode (env=local)';

  return [
    BuildCommand,
    StartCommand,
    LocalCommand
  ];
};
