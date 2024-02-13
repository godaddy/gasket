const path = require('path');
const { cp, copyFile, stat, mkdir, readdir, readFile, writeFile } = require('fs').promises;
const filter = (src) => !src.includes('LICENSE.md');

/**
 * transformLinks - Transform links in the content
 * @param {string|ReadableStream} content The doc content
 * @returns {string|ReadableStream} The transformed content
 */
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

/**
 * createDir - Create a directory if it doesn't exist
 * @param {string} targetRoot Path of the new directory
 * @param {string} dir Name of the new directory
 */
async function createDir(targetRoot, dir) {
  const tpath = path.join(targetRoot, dir);
  try {
    await stat(tpath);
  } catch (err) {
    await mkdir(tpath, { recursive: true });
  }
}

/**
 * copyCreateGasketApp - Copy the create-gasket-app README to the site docs
 * @param {string} projectRoot The root of the project
 */
async function copyCreateGasketApp(projectRoot) {
  const sourceFile = path.join(projectRoot, 'packages', 'create-gasket-app', 'README.md');
  const targetFile = path.join(projectRoot, 'classic', 'docs', 'create-gasket-app.md');
  const file = transformLinks(await readFile(sourceFile, 'utf8'));
  await writeFile(targetFile, file, 'utf8');
}

/**
 * copyPackageDocs - Copy the package docs to the site docs
 * @param {string} sourceRoot The root of the source docs
 * @param {string} targetRoot The root of the target docs
 */
async function copyPackageDocs(sourceRoot, targetRoot) {
  const dirs = ['modules', 'plugins', 'presets'];
  const excludedPath = '@gasket';

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
}

/**
 * copyLifecyleGraph - Copy the lifecycle graph to the site docs
 * @param {string} targetRoot The root of the target docs
 */
async function copyLifecyleGraph(targetRoot) {
  const genSrc = path.join(__dirname, '..', '.docs', 'docs', 'generated-docs');
  await cp(genSrc, targetRoot, { recursive: true, filter });
}

/**
 * copyRootDocs - Copy the root docs to the site docs
 * @param {string} projectRoot The root of the project
 * @param {string} targetRoot The root of the target docs
 */
async function copyRootDocs(projectRoot, targetRoot) {
  const rootDocs = await readdir(path.join(projectRoot, 'docs'));

  for (const file of rootDocs) {
    if (file !== 'generated-docs') {
      const content = transformLinks(await readFile(path.join(projectRoot, 'docs', file), 'utf8'));
      await writeFile(path.join(targetRoot, file), content, 'utf8');
    }
  }

  const readme = transformLinks(await readFile(path.join(projectRoot, 'README.md'), 'utf-8'));
  await writeFile(path.join(targetRoot, 'README.md'), readme, 'utf8');
  await copyFile(path.join(projectRoot, 'LICENSE.md'), path.join(targetRoot, 'LICENSE.md'));
  await copyCreateGasketApp(projectRoot);
}

/**
 * copySiteDocs - Copy the site docs to the classic docs
 * @param {string} projectRoot The root of the project
 */
module.exports = async function copySiteDocs(projectRoot) {
  const sourceRoot = path.join(__dirname, '..', '.docs', 'docs');
  const targetRoot = path.join(projectRoot, 'classic', 'docs');
  await copyPackageDocs(sourceRoot, targetRoot);
  await copyLifecyleGraph(targetRoot);
  await copyRootDocs(projectRoot, targetRoot);
};
