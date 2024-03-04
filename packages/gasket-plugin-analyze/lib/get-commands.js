/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-start" />

/** @type {import('@gasket/engine').HookHandler<'getCommands'>} */
module.exports = function getCommands(gasket, { GasketCommand }) {
  class AnalyzeCommand extends GasketCommand {
    async gasketRun() {
      await this.gasket.exec('build');
    }
  }

  AnalyzeCommand.id = 'analyze';
  AnalyzeCommand.description = 'Analyze application code bundles';

  return AnalyzeCommand;
};
