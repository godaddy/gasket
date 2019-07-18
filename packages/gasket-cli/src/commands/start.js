const GasketCommand = require('../command');

class StartCommand extends GasketCommand {
  async runHooks() {
    await this.gasket.exec('preboot');

    this.gasket.config = await this.gasket.execWaterfall(
      'configure',
      this.gasket.config);

    await this.gasket.exec('start');
  }
}

StartCommand.description = 'Start your application server';

StartCommand.flags = {
  ...GasketCommand.flags
};

module.exports = StartCommand;
