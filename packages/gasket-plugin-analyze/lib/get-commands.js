/**
 * Get the analyze command
 *
 * @param {Gasket} gasket - Gasket
 * @returns {GasketCommand} command
 */
module.exports = function getCommands(gasket) {
  return {
    id: 'analyze',
    description: 'Analyze application code bundles',
    action: async function () {
      await gasket.exec('build');
    }
  };
};
