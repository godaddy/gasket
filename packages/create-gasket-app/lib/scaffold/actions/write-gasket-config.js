import { default as JSON5 } from 'json5';
import path from 'path';
import { writeFile } from 'fs/promises';
import action from '../action-wrapper.js';

// TODO - docs blocks, inline comments, types
function writePluginImports(plugins) {
  return plugins.reduce((acc, cur, index) => {
    acc += `\t\t${cur}${index < plugins.length - 1 ? ',\n' : ''}`;
    return acc;
  }, '');
}

function writeImports(imports) {
  if (!imports) return '';
  return `${Object.entries(imports).map(([importDef, path]) => `import ${importDef} from '${path}';`).join('\n')}\n`;
}

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

function replaceInjectionAssignments(content, assignments) {
  if (!assignments) return content;
  Object.keys(assignments).forEach((key) => {
    content = content.replace(`\'${key}_INJECTION_ASSIGNMENT_REPLACE\'`, assignments[key]);
  });

  return content;
}

function writeExpressions(expressions) {
  if (!expressions) return '';
  return `${expressions.map((expression) => `${expression}`).join('\n')}\n`;
}

function cleanupFields(config) {
  delete config.fields.imports;
  delete config.fields.pluginImports;
  delete config.fields.expressions;
  delete config.fields.injectionAssignments;
}

/**
 * Writes the contents of `pkg` to the app's package.json.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function writeGasketConfig(gasket, context) {
  const { dest, gasketConfig, generatedFiles } = context;
  const fileName = context.typescript ? 'gasket.ts' : 'gasket.js';
  const filePath = path.join(dest, fileName);
  const plugins = gasketConfig.fields.plugins;
  const assignments = gasketConfig.fields.injectionAssignments || null;
  const expressions = gasketConfig.fields.expressions || null;
  gasketConfig.fields.plugins = 'PLUGIN_REPLACE';

  let contents = '';
  contents += `import { makeGasket } from '@gasket/core';\n`;
  contents += writeImports(gasketConfig.fields.pluginImports);
  contents += writeImports(gasketConfig.fields.imports);
  contents += writeExpressions(expressions);
  createInjectionAssignments(gasketConfig.fields, assignments);
  cleanupFields(gasketConfig);

  const pluginImports = `[\n${writePluginImports(plugins)}\n\t]`;
  contents += `\nexport default makeGasket(${JSON5.stringify(gasketConfig.fields, null, 2)});\n`;
  contents = contents.replace('\'PLUGIN_REPLACE\'', pluginImports);
  contents = replaceInjectionAssignments(contents, assignments);

  await writeFile(filePath, contents, 'utf8');
  generatedFiles.add(fileName);
}

export default action('Write gasket config', writeGasketConfig);
