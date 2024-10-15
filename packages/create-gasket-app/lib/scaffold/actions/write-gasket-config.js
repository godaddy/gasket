import { default as JSON5 } from 'json5';
import path from 'path';
import { writeFile } from 'fs/promises';
import action from '../action-wrapper.js';

/**
 * writePluginImports - Write string imports as value(s)
 * @type {import('../../internal').writePluginImports}
 */
function writePluginImports(plugins) {
  return plugins.reduce((acc, cur, index) => {
    acc += `\t\t${cur}${index < plugins.length - 1 ? ',\n' : ''}`;
    return acc;
  }, '');
}

/**
 * writeImports - Write imports to file using key value pairs
 * @type {import('../../internal').writeImports}
 */
function writeImports(imports) {
  if (!imports) return '';
  return `${Object.entries(imports).map(([importDef, importPath]) => `import ${importDef} from '${importPath}';`).join('\n')}\n`;
}

/**
 * createInjectionAssignments - replace object path with a temp string value
 * @type {import('../../internal').createInjectionAssignments}
 */
function createInjectionAssignments(config, assignments) {
  if (!assignments) return '';
  Object.keys(assignments).forEach((key) => {
    const keys = key.split('.');

    keys.reduce((acc, cur, index) => {
      if (index === keys.length - 1) {
        acc[cur] = `${key}_INJECTION_ASSIGNMENT_REPLACE`;
        return;
      }
      return acc[cur];
    }, config);
  });
}

/**
 * replaceInjectionAssignments - replace temp string value with actual value
 * @type {import('../../internal').replaceInjectionAssignments}
 */
function replaceInjectionAssignments(content, assignments) {
  if (!assignments) return content;
  Object.keys(assignments).forEach((key) => {
    content = content.replace(`'${key}_INJECTION_ASSIGNMENT_REPLACE'`, assignments[key]);
  });

  return content;
}

/**
 * writeExpressions - Write expressions to file
 * @type {import('../../internal').writeExpressions}
 */
function writeExpressions(expressions) {
  if (!expressions) return '';
  return `${expressions.map((expression) => `${expression}`).join('\n')}\n`;
}

/**
 * cleanupFields - Remove fields from config object
 * @type {import('../../internal').cleanupFields}
 */
function cleanupFields(config) {
  delete config.fields.imports;
  delete config.fields.pluginImports;
  delete config.fields.expressions;
  delete config.fields.injectionAssignments;
}

/**
 * Writes the contents of `pkg` to the app's package.json.
 *
 * @type {import('../../internal').writeGasketConfig}
 */
async function writeGasketConfig({ context }) {
  const { dest, gasketConfig, generatedFiles, typescript } = context;
  const fileName = typescript ? 'gasket.ts' : 'gasket.js';
  const filePath = path.join(dest, fileName);
  const plugins = gasketConfig.fields.plugins;
  const assignments = gasketConfig.fields.injectionAssignments || null;
  const expressions = gasketConfig.fields.expressions || null;
  gasketConfig.fields.plugins = 'PLUGIN_REPLACE';

  let contents = '';
  if (typescript) contents += `import type { GasketConfigDefinition } from '@gasket/core';\n`;
  contents += `import { makeGasket } from '@gasket/core';\n`;
  contents += writeImports(gasketConfig.fields.pluginImports);
  contents += writeImports(gasketConfig.fields.imports);
  contents += writeExpressions(expressions);
  createInjectionAssignments(gasketConfig.fields, assignments);
  cleanupFields(gasketConfig);

  const pluginImports = `[\n${writePluginImports(plugins)}\n  ]`;
  const typeCoercion = typescript ? ' as GasketConfigDefinition' : '';
  contents += `\nexport default makeGasket(${JSON5.stringify(gasketConfig.fields, null, 2)}${typeCoercion});\n`;
  contents = contents.replace('\'PLUGIN_REPLACE\'', pluginImports);
  contents = replaceInjectionAssignments(contents, assignments);

  await writeFile(filePath, contents, 'utf8');
  generatedFiles.add(fileName);
}

export default action('Write gasket config', writeGasketConfig);
