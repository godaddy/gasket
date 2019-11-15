const buildDocsConfigSet = require('./utils/build-config-set');
const collateFiles = require('./utils/collate-files');
const generateIndex = require('./utils/generate-index');

/**
 * Get the docs command
 *
 * @param {Gasket} gasket - Gasket
 * @param {GasketCommand} GasketCommand - Base Gasket command to extend
 * @returns {GasketCommand} command
 */
module.exports = function getCommands(gasket, { GasketCommand, flags }) {

  class DocsCommand extends GasketCommand {
    async gasketRun() {
      const docsConfigSet = await buildDocsConfigSet(gasket);
      await collateFiles(docsConfigSet);
      await generateIndex(docsConfigSet);
      if (this.parsed.flags.view) {
        await this.gasket.exec('docsView', docsConfigSet);
      }
    }
  }

  DocsCommand.id = 'docs';
  DocsCommand.description = 'Generate docs for the app';
  DocsCommand.flags = {
    view: flags.boolean({
      default: true,
      description: 'View the docs after generating',
      allowNo: true
    }),
  };

  return DocsCommand;
};
