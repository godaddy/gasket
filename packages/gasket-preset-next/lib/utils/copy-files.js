import path from 'path';
import fs from 'fs/promises';

export default async function copyFiles(context) {
  const { FileSet, dest } = context;
  const hasDir = file => file.includes('/');
  const getDirs = file => file.split('/').slice(0, -1);
  const hasGlob = file => file.includes('*');
  const isVariant = file => file.includes('_variants');

  for (const file of Array.from(FileSet)) {
    if (hasGlob(file)) {
      const destDir = file.replace('/*', '');
      await fs.cp(path.join(import.meta.dirname, '..', '..', 'generator', 'app-router', destDir), dest, { recursive: true, filter: f => !f.includes('_variant') });
      continue;
    }

    if (isVariant(file)) {
      const filename = file.split('/').pop();
      const content = await fs.readFile(path.join(import.meta.dirname, '..', '..', 'generator', 'app-router', file), 'utf8');
      await fs.writeFile(path.join(dest, filename), content, 'utf-8');
      continue;
    }

    const dirs = hasDir(file) ? getDirs(file) : null;
    if (dirs) {
      await fs.mkdir(path.join(dest, ...dirs), { recursive: true });
    }

    const content = await fs.readFile(path.join(import.meta.dirname, '..', '..', 'generator', 'app-router', file), 'utf8');
    await fs.writeFile(path.join(dest, file), content);
  }
}
