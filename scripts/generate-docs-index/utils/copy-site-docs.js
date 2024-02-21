const path = require('path');
const { cp, readdir, readFile, writeFile } = require('fs').promises;
const formatFilename = require('./format-filename');
const addFrontMatter = require('./add-front-matter');
const transformLinks = require('./transform-links');
const createDir = require('./create-dir');

/**
 * transformFile - Transform the content of a file
 * @param {string} content The content of the file
 * @param {string} filename The name of the file
 * @returns {string} The transformed content
 */
function transformFile(content, filename) {
  content = transformLinks(content);
  const { transformedContent, file } = addFrontMatter(content, filename);
  return { content: transformedContent, filename: file };
}

/**
 * copyCreateGasketApp - Copy the create-gasket-app README to the site docs
 * @param {string} projectRoot The root of the project
 */
async function copyCreateGasketApp(projectRoot) {
  const sourceFile = path.join(projectRoot, 'packages', 'create-gasket-app', 'README.md');
  const { content, filename } = transformFile(await readFile(sourceFile, 'utf8'), 'create-gasket-app.md');
  const targetFile = path.join(projectRoot, 'site', 'docs', filename);
  await writeFile(targetFile, content, 'utf8');
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
        filter: (src) => !src.includes('LICENSE.md')
      }
    );
    // Create an index file for each folder
    await writeFile(
      path.join(targetRoot, dir, `${formatFilename(dir)}.mdx`),
      `import DocCardList from '@theme/DocCardList';\n\n<DocCardList />`,
      'utf8'
    );
  }
}

/**
 * copyLifecyleGraph - Copy the lifecycle graph to the site docs
 * @param {string} targetRoot The root of the target docs
 */
async function copyLifecyleGraph(targetRoot) {
  const genSrc = path.join(__dirname, '..', '.docs', 'docs', 'generated-docs', 'lifecycle-graphs.md');
  const { content, filename } = transformFile(await readFile(genSrc, 'utf8'), 'lifecycle-graphs.md');
  await writeFile(path.join(targetRoot, filename), content, 'utf8');
}

/**
 * copyRootDocs - Copy the root docs to the site docs
 * @param {string} projectRoot The root of the project
 * @param {string} targetRoot The root of the target docs
 */
async function copyRootDocs(projectRoot, targetRoot) {
  const rootDocs = await readdir(path.join(projectRoot, 'docs'));

  // Copy the root docs folder
  for (const file of rootDocs) {
    if (file !== 'generated-docs') {
      const { content: fileContent, filename } = transformFile(
        await readFile(path.join(projectRoot, 'docs', file), 'utf-8'),
        file
      );
      await writeFile(path.join(targetRoot, filename), fileContent, 'utf8');
    }
  }

  // Copy the README, CONTRIBUTING, SECURITY, and LICENSE files
  const { content: readme, filename: readmeFilename } = transformFile(
    await readFile(path.join(projectRoot, 'README.md'), 'utf-8'),
    'README.md'
  );
  await writeFile(path.join(targetRoot, readmeFilename), readme, 'utf8');

  const { content: contributing, filename: contributingFilename } = transformFile(
    await readFile(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8'),
    'CONTRIBUTING.md'
  );
  await writeFile(path.join(targetRoot, contributingFilename), contributing, 'utf8');

  const { content: security, filename: securityFilename } = transformFile(
    await readFile(path.join(projectRoot, 'SECURITY.md'), 'utf-8'),
    'SECURITY.md'
  );
  await writeFile(path.join(targetRoot, securityFilename), security, 'utf8');

  const { content: license, filename: licensenFilename } = transformFile(
    await readFile(path.join(projectRoot, 'LICENSE.md'), 'utf-8'),
    'LICENSE.md'
  );
  await writeFile(path.join(targetRoot, licensenFilename), license, 'utf8');
}

/**
 * copySiteDocs - Copy the site docs to the site docs
 * @param {string} projectRoot The root of the project
 */
module.exports = async function copySiteDocs(projectRoot) {
  const sourceRoot = path.join(__dirname, '..', '.docs', 'docs');
  const targetRoot = path.join(projectRoot, 'site', 'docs');
  await copyPackageDocs(sourceRoot, targetRoot);
  await copyCreateGasketApp(projectRoot);
  await copyLifecyleGraph(targetRoot);
  await copyRootDocs(projectRoot, targetRoot);
};
