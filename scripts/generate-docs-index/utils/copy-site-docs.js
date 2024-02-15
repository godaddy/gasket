const path = require('path');
const { cp, stat, mkdir, readdir, readFile, writeFile } = require('fs').promises;
const filter = (src) => !src.includes('LICENSE.md');
const formatFilename = require('./format-filename');

/**
 * addFrontMatter - Add front matter to the content
 * @param {string} content The content of the file
 * @param {string} filename The name of the file
 * @returns {string} The content with front matter
 */
function addFrontMatter(content, filename) {
  const config = {
    'README.md': {
      label: 'Overview',
      sidebar_position: 1,
      imports: ['import useBaseUrl from \'@docusaurus/useBaseUrl\';'],
      transforms: [{
        search: '"/img/logo-cover.svg"',
        replace: '{useBaseUrl(\'img/logo-cover.svg\')}'
      }]
    },
    'quick-start.md': {
      sidebar_position: 2
    },
    'lifecycle-graphs.md': {
      sidebar_position: 3
    },
    'create-gasket-app.md': {
      sidebar_position: 4
    },
    'typescript.md': {
      sidebar_position: 5
    },
    'upgrades.md': {
      sidebar_position: 6
    },
    'upgrade-to-6.md': {
      sidebar_position: 7
    },
    'LICENSE.md': {
      label: 'License',
      sidebar_position: 8
    }
  };

  if (config[filename]?.transforms) {
    content = config[filename].transforms.reduce((content, transform) => {
      return content.replace(transform.search, transform.replace);
    }, content);
  }

  const frontMatter = {
    title: `''`,
    hide_title: true,
    sidebar_label: config[filename]?.label || `${formatFilename(filename)}`,
    sidebar_position: config[filename]?.sidebar_position || 50
  };

  const data = Object.entries(frontMatter).map(([key, value]) => `${key}: ${value}`).join('\n');
  const imports = config[filename]?.imports
    ? `\n${config[filename].imports.join('\n')}\n`
    : '';

  return `---\n${data}\n---\n${imports}\n${content}`;
}

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

function transformFile(content, filename) {
  content = transformLinks(content);
  content = addFrontMatter(content, filename);
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
  const targetFile = path.join(projectRoot, 'site', 'docs', 'create-gasket-app.md');
  const file = transformFile(await readFile(sourceFile, 'utf8'), 'create-gasket-app.md');
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
  const genSrc = path.join(__dirname, '..', '.docs', 'docs', 'generated-docs', 'lifecycle-graphs.md');
  const file = transformFile(await readFile(genSrc, 'utf8'), 'lifecycle-graphs.md');
  await writeFile(path.join(targetRoot, 'lifecycle-graphs.md'), file, 'utf8');
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
      const content = transformFile(await readFile(path.join(projectRoot, 'docs', file), 'utf8'), file);
      await writeFile(path.join(targetRoot, file), content, 'utf8');
    }
  }

  const readme = transformFile(await readFile(path.join(projectRoot, 'README.md'), 'utf-8'), 'README.md');
  await writeFile(path.join(targetRoot, 'README.mdx'), readme, 'utf8');

  const license = transformFile(await readFile(path.join(projectRoot, 'LICENSE.md'), 'utf-8'), 'LICENSE.md');
  await writeFile(path.join(targetRoot, 'LICENSE.md'), license, 'utf8');
  await copyCreateGasketApp(projectRoot);
}

/**
 * copySiteDocs - Copy the site docs to the site docs
 * @param {string} projectRoot The root of the project
 */
module.exports = async function copySiteDocs(projectRoot) {
  const sourceRoot = path.join(__dirname, '..', '.docs', 'docs');
  const targetRoot = path.join(projectRoot, 'site', 'docs');
  await copyPackageDocs(sourceRoot, targetRoot);
  await copyLifecyleGraph(targetRoot);
  await copyRootDocs(projectRoot, targetRoot);
};
