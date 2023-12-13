import { default as JSON5 } from 'json5';
import path from 'path';
import { writeFile } from 'fs/promises';
import action from '../action-wrapper.js';

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
  const contents = 'export default ' +
    JSON5.stringify(gasketConfig, null, 2) + ';\n';

  await writeFile(filePath, contents, 'utf8');
  generatedFiles.add(fileName);
}

export default action('Write gasket config', writeGasketConfig);
