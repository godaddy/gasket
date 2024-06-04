const { runShellCommand } = require('../../packages/gasket-utils');
const copySiteDocs = require('./utils/copy-site-docs');
const wait = require('./utils/wait');
const { readFile, writeFile, cp } = require('fs').promises;
const path = require('path');

const startTag = '<!-- START GENERATED -->';
const endTag = '<!-- END GENERATED -->';

const projectRoot = path.resolve(__dirname, '..', '..');
const cliBin = path.join(projectRoot, 'packages', 'gasket-cli', 'bin', 'run');
const sourcePath = path.join(__dirname, '.docs', 'docs', 'README.md');
const targetPath = path.join(projectRoot, 'README.md');

async function main() {
  await runShellCommand(cliBin, ['docs', '--no-view'], { cwd: __dirname });

  // copy over generated docs generated-docs
  const genSrc = path.join(__dirname, '.docs', 'docs', 'generated-docs');
  const genTgt = path.join(projectRoot, 'docs', 'generated-docs');
  await cp(genSrc, genTgt, { recursive: true });

  let content = await readFile(sourcePath, 'utf-8');

  // fix up the generated docs index
  content = content
    .replace(/# App[^#]+/gm, '')
    .replace(/:.+\/@gasket\//g, ':/packages/gasket-')
    .replace(/All configured/g, 'Available')
    .replace(/Dependencies and supporting/, 'Supporting')
    .replace(/.+:app\/README.md\n/, '')
    .replace(/.+plugins\/config-plugin.+\n/, '')
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
  // eslint-disable-next-line no-console
  console.log('DONE');
}

main();
