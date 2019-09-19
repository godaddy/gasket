const buildDocsConfigSet = require('./utils/build-config-set');
const collateFiles = require('./utils/collate-files');
const generateIndex = require('./utils/generate-index');

/**
 * Attach additional metadata to pluginInfo
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} BaseCommand - Base Gasket command to extend
 * @returns {GasketCommand} command
 */
module.exports = function getCommands(gasket, { BaseCommand }) {

  class DocsCommand extends BaseCommand {
    async runHooks() {
      const docsConfigSet = await buildDocsConfigSet(gasket);
      await collateFiles(docsConfigSet);
      await generateIndex(docsConfigSet);
      await gasket.exec('docsView', docsConfigSet);
    }
  }

  DocsCommand.id = 'docs';
  DocsCommand.description = 'Generate docs for the app';

  return DocsCommand;
};
