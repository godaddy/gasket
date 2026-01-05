import path from 'path';
import { withSpinner } from '../with-spinner.js';
import { cp, readdir, rename } from 'fs/promises';

const EXCLUDED_FILES = ['node_modules'];
const TEMPLATE_SUFFIX = '.template';

/**
 * Recursively processes .template files in a directory,
 * renaming them to remove the .template suffix.
 * @param {string} dir - Directory to process
 * @returns {Promise<string[]>} - List of renamed files (destination paths)
 */
async function processTemplateFiles(dir) {
  console.log('processTemplateFiles', dir);
  const renamedFiles = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await processTemplateFiles(fullPath);
      renamedFiles.push(...nested);
    } else if (entry.name.endsWith(TEMPLATE_SUFFIX)) {
      const newName = entry.name.slice(0, -TEMPLATE_SUFFIX.length);
      const newPath = path.join(dir, newName);
      await rename(fullPath, newPath);
      renamedFiles.push(newPath);
    }
  }

  return renamedFiles;
}

/** @type {import('../../internal.d.ts').copyTemplate} */
async function copyTemplate({ context }) {
  if (!context.templateDir) return;

  const entries = await readdir(context.templateDir, { withFileTypes: true });
  const filesToCopy = entries.filter(entry => !EXCLUDED_FILES.includes(entry.name));

  for (const entry of filesToCopy) {
    const sourcePath = path.join(context.templateDir, entry.name);
    const destPath = path.join(context.dest, entry.name);
    await cp(sourcePath, destPath, { recursive: true });
    context.generatedFiles.add(path.relative(context.cwd, destPath));
  }

  // Process .template files recursively
  const renamedFiles = await processTemplateFiles(context.dest);
  for (const filePath of renamedFiles) {
    // Remove the old .template entry and add the renamed one
    const templatePath = filePath + TEMPLATE_SUFFIX;
    context.generatedFiles.delete(path.relative(context.cwd, templatePath));
    context.generatedFiles.add(path.relative(context.cwd, filePath));
  }
}

export default withSpinner('Copy template files', copyTemplate);
