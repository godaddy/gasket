const { runShellCommand } = require('../../packages/gasket-utils');
const fs = require('fs');
const path = require('path');
const {
  promisify
} = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const startTag = '<!-- GENERATED -->';
const endTag = '<!-- END GENERATED -->';


const projectRoot = path.resolve(__dirname, '..', '..');
const cliBin = path.join(projectRoot, 'packages', 'gasket-cli', 'bin', 'run');
const sourcePath = path.join(__dirname, '.docs', 'README.md');
const targetPath = path.join(projectRoot, 'docs', 'README.md');

async function index() {
  await runShellCommand(cliBin, ['docs', '--no-view'], { cwd: __dirname });

  let content = await readFile(sourcePath, 'utf-8');

  content = content
    .replace(/# App[^#]+/gm, '')
    .replace(/:.+\/@gasket\//g, ':/packages/gasket-')
    .replace(/All configured/g, 'Available')
    .replace(/Dependencies and supporting/, 'Supporting')
    .replace(/.+:app\/README.md\n/, '')
    .replace(/.+plugins\/config-plugin.+\n/, '')
  ;

  const template = await readFile(targetPath, 'utf-8');
  const start = template.indexOf(startTag) + startTag.length;
  const end = template.indexOf(endTag);
  content = template.substring(0, start) + '\n\n' + content + template.substring(end);

  await writeFile(targetPath, content, 'utf-8');
  console.log('DONE');
}

index();
