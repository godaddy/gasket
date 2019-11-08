const buildDocsConfigSet = require('./utils/build-config-set');
const collateFiles = require('./utils/collate-files');
const generateIndex = require('./utils/generate-index');

/**
 * Get the docs command
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} GasketCommand - Base Gasket command to extend
 * @returns {GasketCommand} command
 */
module.exports = function getCommands(gasket, { GasketCommand }) {

  class DocsCommand extends GasketCommand {
    async gasketRun() {
      const docsConfigSet = await buildDocsConfigSet(gasket);
      await collateFiles(docsConfigSet);
      await generateIndex(docsConfigSet);
      await this.gasket.exec('docsView', docsConfigSet);
    }
  }

  DocsCommand.id = 'docs';
  DocsCommand.description = 'Generate docs for the app';

  return DocsCommand;
};
