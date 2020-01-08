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
      let guides = await this.gasket.exec('docsGenerate', docsConfigSet);
      if (guides) {
        guides = guides.reduce((acc, cur) => {
          if (Array.isArray(cur)) {
            acc.push(...cur);
          } else {
            cur && acc.push(cur);
          }
          return acc;
        }, []);
      } else {
        guides = [];
      }
      docsConfigSet.guides.unshift(...guides);
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
    })
  };

  return DocsCommand;
};
