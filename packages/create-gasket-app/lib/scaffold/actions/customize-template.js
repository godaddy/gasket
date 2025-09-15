import path from 'path';
import { withSpinner } from '../with-spinner.js';
import { readFile, writeFile } from 'fs/promises';

/**
 * Customizes template files with app-specific values
 * @param {object} options - Options object
 * @param {object} options.context - Gasket context
 * @returns {Promise<void>}
 */
async function customizeTemplate({ context }) {
  if (!context.templateDir || !context.appName) return;

  await Promise.all([
    updatePackageJson(context),
    updateReadme(context)
  ]);
}

/**
 * Updates package.json name field with app name
 * @param {object} context - Gasket context
 * @returns {Promise<void>}
 */
async function updatePackageJson(context) {
  const packageJsonPath = path.join(context.dest, 'package.json');

  try {
    const content = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);

    packageJson.name = context.appName;

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  } catch (error) {
    // Ignore if package.json doesn't exist or is malformed
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: Could not update package.json: ${error.message}`);
    }
  }
}

/**
 * Updates README.md first line with app name
 * @param {object} context - Gasket context
 * @returns {Promise<void>}
 */
async function updateReadme(context) {
  const readmePath = path.join(context.dest, 'README.md');

  try {
    const content = await readFile(readmePath, 'utf8');
    const lines = content.split('\n');

    if (lines.length > 0) {
      // Replace first line with app name as h1
      lines[0] = `# ${context.appName}`;

      await writeFile(readmePath, lines.join('\n'));
    }
  } catch (error) {
    // Ignore if README.md doesn't exist
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: Could not update README.md: ${error.message}`);
    }
  }
}

export default withSpinner('Customize template files', customizeTemplate);
