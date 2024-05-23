/// <reference types="@gasket/core" />

const buildDocsConfigSet = require('./utils/build-config-set');
const collateFiles = require('./utils/collate-files');
const generateIndex = require('./utils/generate-index');

/**
 * Get the docs command
 * @type {import('@gasket/core').HookHandler<'commands'>}
 */
module.exports = function commands(gasket) {
  return {
    id: 'docs',
    description: 'Generate docs for the app',
    options: [
      {
        name: 'no-view',
        description: 'View the docs after generating',
        type: 'boolean'
      }
    ],
    action: async function ({ view }) {
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

      if (view) {
        await gasket.exec('docsView', docsConfigSet);
      }
    }
  };
};
