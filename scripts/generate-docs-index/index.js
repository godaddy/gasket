import { runShellCommand } from '../../packages/gasket-utils/lib/index.js';
import copySiteDocs from './utils/copy-site-docs.js';
import wait from './utils/wait.js';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const dirName = path.dirname(fileURLToPath(import.meta.url));
const startTag = '<!-- START GENERATED -->';
const endTag = '<!-- END GENERATED -->';

const projectRoot = path.resolve(dirName, '..', '..');
const sourcePath = path.join(dirName, '.docs', 'docs', 'README.md');
const targetPath = path.join(projectRoot, 'README.md');

/**
 *
 */
async function main() {
  await runShellCommand('node', ['gasket.js', 'docs', '--no-view'], { cwd: dirName });

  let content = await readFile(sourcePath, 'utf-8');

  // fix up the generated docs index
  content = content
    .replace(/# App[^#]+/gm, '')
    .replace(/:.+\/@gasket\//g, ':/packages/gasket-')
    .replace(/All configured/g, 'Available')
    .replace(/Dependencies and supporting/, 'Supporting')
    .replace(/.+:app\/README.md\n/, '')
    .replace(/\| (config-plugin|site-docs-plugin)+.*/g, '')
    // removed a single test/ dir, duplicate from generating both mocha and jest
    .replace(/.+test\/.+\n/, '')
    .replace(':generated-docs/', ':/docs/generated-docs/')
    // replace homepage link with relative readme
    .replace('https://github.com/godaddy/gasket/tree/main/packages/create-gasket-app', '/packages/create-gasket-app/README.md');

  const template = await readFile(targetPath, 'utf-8');
  const start = template.indexOf(startTag) + startTag.length;
  const end = template.indexOf(endTag);

  // substitute in the generated content
  content = template.substring(0, start) + '\n\n' + content + template.substring(end);

  await writeFile(targetPath, content, 'utf-8');
  // Need to wait for the docs to be generated before copying them
  await wait(100);
  // Copy docs for docs site and format for use
  await copySiteDocs(projectRoot);
  console.log('DONE');
}

main();
