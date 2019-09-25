/**
 * Get the analyze command
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} GasketCommand - Base Gasket command to extend
 * @returns {GasketCommand} command
 */
module.exports = function getCommands(gasket, { GasketCommand }) {

  class AnalyzeCommand extends GasketCommand {
    async runHooks() {
      await this.gasket.exec('build');
    }
  }

  DocsCommand.id = 'analyze';
  AnalyzeCommand.description = 'Analyze application code bundles';

  return AnalyzeCommand;
};
