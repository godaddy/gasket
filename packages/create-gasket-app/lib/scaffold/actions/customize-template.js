import path from 'path';
import { withSpinner } from '../with-spinner.js';
import { readFile, writeFile } from 'fs/promises';

/** @type {import('../../internal.d.ts').customizeTemplate} */
async function customizeTemplate({ context }) {
  if (!context.templateDir || !context.appName) return;

  await Promise.all([
    updatePackageJson(context),
    updateReadme(context),
    updateTemplateFiles(context)
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
 * Updates README.md with app name placeholders replaced
 * @param {object} context - Gasket context
 * @returns {Promise<void>}
 */
async function updateReadme(context) {
  const readmePath = path.join(context.dest, 'README.md');

  try {
    const content = await readFile(readmePath, 'utf8');

    // Replace all {appName} placeholders with actual app name
    const updatedContent = content.replace(/{{{appName}}}/g, context.appName);

    await writeFile(readmePath, updatedContent);
  } catch (error) {
    // Ignore if README.md doesn't exist
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: Could not update README.md: ${error.message}`);
    }
  }
}

/**
 * Updates template files with app name placeholders replaced
 * @param {object} context - Gasket context
 * @returns {Promise<void>}
 */
async function updateTemplateFiles(context) {
  const templateFilePaths = [
    path.join(context.dest, 'pages/index.tsx'),
    path.join(context.dest, 'app/page.tsx')
  ];

  const updatePromises = templateFilePaths.map(async (filePath) => {
    try {
      const content = await readFile(filePath, 'utf8');

      // Replace all {appName} placeholders with actual app name
      const updatedContent = content.replace(/{{{appName}}}/g, context.appName);

      await writeFile(filePath, updatedContent);
    } catch (error) {
      // Ignore if file doesn't exist (not all templates have these files)
      if (error.code !== 'ENOENT') {
        console.warn(`Warning: Could not update ${filePath}: ${error.message}`);
      }
    }
  });

  await Promise.all(updatePromises);
}

export default withSpinner('Customize template files', customizeTemplate);
