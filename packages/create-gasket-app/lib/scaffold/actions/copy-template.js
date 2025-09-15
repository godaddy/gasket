import path from 'path';
import { withSpinner } from '../with-spinner.js';
import { cp, readdir } from 'fs/promises';

const EXCLUDED_FILES = ['node_modules'];

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
}

export default withSpinner('Copy template files', copyTemplate);
