const GasketCommand = require('../command');
const { flags } = require('@oclif/command');

class BuildCommand extends GasketCommand {
  async runHooks() {
    this.gasket.config.analyze = this.flags && this.flags.analyze;

    await this.gasket.exec('build');
  }
}

BuildCommand.description = `Prepare your application code for deployment`;

BuildCommand.flags = {
  ...GasketCommand.flags,
  analyze: flags.boolean({
    env: 'ANALYZE',
    description: 'Top-level app directory'
  })
};

module.exports = BuildCommand;
