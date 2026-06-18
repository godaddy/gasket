import { default as JSON5 } from 'json5';
import path from 'path';
import { writeFile } from 'fs/promises';
import { withSpinner } from '../with-spinner.js';

/** @type {import('../../internal.d.ts').writePluginImports} */
function writePluginImports(plugins) {
  return plugins.reduce((acc, cur, index) => {
    acc += `\t\t${cur}${index < plugins.length - 1 ? ',\n' : ''}`;
    return acc;
  }, '');
}

/** @type {import('../../internal.d.ts').writeImports} */
function writeImports(imports) {
  if (!imports) return '';
  return `${Object.entries(imports).map(([importDef, importPath]) => `import ${importDef} from '${importPath}';`).join('\n')}\n`;
}

// Placeholder strings let raw JS expressions survive JSON5.stringify
/** @type {import('../../internal.d.ts').createInjectionAssignments} */
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

/** @type {import('../../internal.d.ts').replaceInjectionAssignments} */
function replaceInjectionAssignments(content, assignments) {
  if (!assignments) return content;
  Object.keys(assignments).forEach((key) => {
    content = content.replace(`'${key}_INJECTION_ASSIGNMENT_REPLACE'`, assignments[key]);
  });

  return content;
}

/** @type {import('../../internal.d.ts').writeExpressions} */
function writeExpressions(expressions) {
  if (!expressions) return '';
  return `${expressions.map((expression) => `${expression}`).join('\n')}\n`;
}

/** @type {import('../../internal.d.ts').cleanupFields} */
function cleanupFields(config) {
  delete config.fields.imports;
  delete config.fields.pluginImports;
  delete config.fields.expressions;
  delete config.fields.injectionAssignments;
}

/** @type {import('../../internal.d.ts').writeGasketConfig} */
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

export default withSpinner('Write gasket config', writeGasketConfig);
