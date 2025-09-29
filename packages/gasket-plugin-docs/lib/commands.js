/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-command" />

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

      const generated = await gasket.exec('docsGenerate', docsConfigSet);
      const docs = Array.isArray(generated) ? generated.flat().filter(Boolean) : [generated];
      const guides = docs.filter(gen => gen && !gen.name.includes('template'));
      const templates = docs.filter(gen => gen && gen.name.includes('template'));

      // Ensure guides array exists before unshifting
      if (!docsConfigSet.guides) {
        docsConfigSet.guides = [];
      }
      docsConfigSet.guides.unshift(...guides);

      // Ensure templates array exists before unshifting
      if (!docsConfigSet.templates) {
        docsConfigSet.templates = [];
      }
      docsConfigSet.templates.unshift(...templates);

      await generateIndex(docsConfigSet);

      if (view) {
        await gasket.exec('docsView', docsConfigSet);
      }
    }
  };
};
