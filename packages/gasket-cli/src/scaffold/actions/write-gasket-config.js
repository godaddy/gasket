const JSON5 = require('json5');
const path = require('path');
const { writeFile } = require('fs').promises;
const action = require('../action-wrapper');

/**
 * Writes the contents of `pkg` to the app's package.json.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function writeGasketConfig(context) {
  const { dest, gasketConfig, presets, plugins, generatedFiles } = context;
  const fileName = 'gasket.config.js';
  const filePath = path.join(dest, fileName);

  gasketConfig.add('plugins', {
    presets,
    ...(plugins && plugins.length ? { add: plugins } : {})
  });

  //
  // Use JSON5 to stringify the config and add export for CommonJS
  //
  const contents = 'module.exports = ' +
    JSON5.stringify(gasketConfig, null, 2) + ';\n';

  await writeFile(filePath, contents, 'utf8');
  generatedFiles.add(fileName);
}

module.exports = action('Write gasket config', writeGasketConfig);
