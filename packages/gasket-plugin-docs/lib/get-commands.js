const buildDocsConfigSet = require('./utils/build-config-set');
const collateFiles = require('./utils/collate-files');
const generateIndex = require('./utils/generate-index');

/**
 * Get the docs command
 *
 * @param {Gasket} gasket - Gasket
 * @returns {GasketCommand} command
 */
module.exports = function getCommands(gasket) {
  const DocsCommand = {
    id: 'docs',
    description: 'Generate docs for the app',
    options: [
      {
        name: 'view',
        description: 'View the docs after generating',
        default: false,
        type: 'boolean'
      }
    ],
    action: async function (options) {
      const docsConfigSet = await buildDocsConfigSet(gasket);
      await collateFiles(docsConfigSet);
      let guides = await gasket.exec('docsGenerate', docsConfigSet);
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
      if (options.View) {
        await gasket.exec('docsView', docsConfigSet);
      }
    }
  };

  return DocsCommand;
};
