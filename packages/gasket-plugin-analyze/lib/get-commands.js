/// <reference types="@gasket/cli" />
/// <reference types="@gasket/plugin-start" />

/**
 * Get the analyze command
 *
 * @type {import('@gasket/engine').HookHandler<'getCommands'>}
 */
module.exports = function getCommands(gasket) {
  const AnalyzeCommand = {
    id: 'analyze',
    description: 'Analyze application code bundles',
    action: async function () {
      await gasket.exec('build');
    }
  };

  return AnalyzeCommand;
};
