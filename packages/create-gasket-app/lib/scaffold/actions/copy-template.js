import path from 'path';
import { withSpinner } from '../with-spinner.js';
import { cp, readdir, writeFile, access } from 'fs/promises';

const EXCLUDED_FILES = ['node_modules'];

/**
 * Ensures a .gitignore exists in the generated app.
 * npm intentionally strips .gitignore files from published packages.
 * We will need to update our templates to use a different name
 * such as gitignore or .gitignore.template to survive installing.
 * @param {import("../../internal.d.ts").PartialCreateContext} context - Create context
 * @returns {Promise<void>}
 */
export async function ensureGitignore(context) {
  const destPath = path.join(context.dest, '.gitignore');

  const exists = await access(destPath)
    .then(() => true)
    .catch(() => false);

  if (exists) {
    return;
  }

  // No template gitignore found, create a basic one
  const basicGitignore = [
    '# Dependencies',
    'node_modules',
    '',
    '# Logs',
    '*.log',
    '',
    '# Env files',
    '.env',
    '.env.local'
  ].join('\n');

  await writeFile(destPath, basicGitignore, 'utf8');
  context.generatedFiles.add(path.relative(context.cwd, destPath));
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

  // Ensure .gitignore is properly created
  await ensureGitignore(context);
}

export default withSpinner('Copy template files', copyTemplate);
