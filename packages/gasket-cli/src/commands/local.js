const StartCommand = require('./start');

class LocalCommand extends StartCommand {
  async configure(userConfig = {}) {
    userConfig.env = 'local';
    return super.configure(userConfig);
  }

  async runHooks() {
    this.flags = {
      ...this.flags,
      env: 'local'
    };

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

LocalCommand.description = 'Start your application server in local development mode';

LocalCommand.flags = {
  ...StartCommand.flags
};

module.exports = LocalCommand;
