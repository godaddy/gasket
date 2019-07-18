const GasketCommand = require('../command');

class AnalyzeCommand extends GasketCommand {
  async runHooks() {
    this.gasket.config.analyze = true;

    await this.gasket.exec('build');
  }
}

AnalyzeCommand.description = 'Analyze application code bundles';

AnalyzeCommand.flags = {
  ...GasketCommand.flags
};

module.exports = AnalyzeCommand;
