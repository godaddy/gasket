const path = require('path');
const { cp, copyFile, stat, mkdir, readdir, readFile, writeFile } = require('fs').promises;

function transformLinks(content) {
  content = content
    .replace(/\/packages\/gasket-plugin/g, '/docs/plugins/plugin')
    .replace(/\/packages\/gasket-preset/g, '/docs/presets/preset')
    .replace(/\/packages\/gasket-(?!plugin)(?!preset)/g, '/docs/modules/')
    .replace('/docs/generated-docs/', '/docs/')
    .replace('./LICENSE.md', '/docs/LICENSE.md')
    .replace('/packages/create-gasket-app/README.md', '/docs/create-gasket-app');
  return content;
}

async function createDir(targetRoot, dir) {
  const tpath = path.join(targetRoot, dir);
  try {
    await stat(tpath);
  } catch (err) {
    await mkdir(tpath, { recursive: true });
  }
}

async function copyCreateGasketApp(projectRoot) {
  const sourceFile = path.join(projectRoot, 'packages', 'create-gasket-app', 'README.md');
  const targetFile = path.join(projectRoot, 'classic', 'docs', 'create-gasket-app.md');
  const file = transformLinks(await readFile(sourceFile, 'utf8'));
  await writeFile(targetFile, file, 'utf8');
}

module.exports = async function copySiteDocs(projectRoot) {
  const sourceRoot = path.join(__dirname, '..', '.docs', 'docs');
  const targetRoot = path.join(projectRoot, 'classic', 'docs');
  const dirs = ['modules', 'plugins', 'presets'];
  const excludedPath = '@gasket';
  const filter = (src) => !src.includes('LICENSE.md');

  for (const dir of dirs) {
    await createDir(targetRoot, dir);
    await cp(
      path.join(sourceRoot, dir, excludedPath),
      path.join(targetRoot, dir),
      {
        recursive: true,
        filter
      });
  }

  const genSrc = path.join(__dirname, '..', '.docs', 'docs', 'generated-docs');
  await cp(genSrc, targetRoot, { recursive: true, filter });

  const rootDocs = await readdir(path.join(projectRoot, 'docs'));

  for (const file of rootDocs) {
    if (file !== 'generated-docs') {
      const content = transformLinks(await readFile(path.join(projectRoot, 'docs', file), 'utf8'));
      await writeFile(path.join(targetRoot, file), content, 'utf8');
    }
  }

  const readme = transformLinks(await readFile(path.join(projectRoot, 'README.md'), 'utf-8'));
  await writeFile(path.join(targetRoot, 'README.md'),readme,'utf8');
  await copyFile(path.join(projectRoot, 'LICENSE.md'), path.join(targetRoot, 'LICENSE.md'));
  await copyCreateGasketApp(projectRoot);
}
