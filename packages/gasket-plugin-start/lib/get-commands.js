/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-log" />

/**
 * Get the build, start, and local commands
 * @type {import('@gasket/engine').HookHandler<'getCommands'>}
 */
module.exports = function getCommands(gasket, { GasketCommand, flags }) {

  class BuildCommand extends GasketCommand {
    async gasketRun() {
      await this.gasket.exec('build');

      // @ts-ignore
      // TEMP: ignoring as a temporary workaround until plugin-command is updated
      if (this.gasket.command.flags.exit) {
        this.gasket.logger.debug('force exit');
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      }
    }
  }
  BuildCommand.id = 'build';
  BuildCommand.description = 'Prepare your app';
  BuildCommand.flags = {
    exit: flags.boolean({
      default: false,
      description: 'Exit process immediately after command completes'
    })
  };


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
  }

  LocalCommand.id = 'local';
  LocalCommand.description = 'Build then start your app in local environment';
  LocalCommand.flags = {
    env: flags.string({
      env: 'GASKET_ENV',
      description: 'Target runtime environment',
      default: 'local'
    })
  };

  return [
    BuildCommand,
    StartCommand,
    LocalCommand
  ];
};
