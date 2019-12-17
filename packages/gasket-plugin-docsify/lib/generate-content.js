const defaultsDeep = require('lodash.defaultsdeep');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const mkdirp = promisify(require('mkdirp'));
const glob = promisify(require('glob'));

const isCssFile = /.css$/;
const srcDir = path.join(__dirname, '..', 'generator');
const srcIndex = path.join(srcDir, 'index.html');


/**
 * Generate the main index.html served by Docsify
 *
 * @param {Object} docsifyConfig - Config for docsify plugin
 * @param {DocsConfigSet} docsConfigSet -
 * @returns {Promise<string>} output file
 */
async function generateContent(docsifyConfig, docsConfigSet) {
  const { theme = 'styles/gasket.css', config = {} } = docsifyConfig;
  const { docsRoot } = docsConfigSet;

  const Handlebars = require('handlebars');
  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context, null, 2);
  });

  const windowConfig = defaultsDeep(config, {
    name: docsConfigSet.app.name
  });

  const stylesheets = [
    isCssFile.test(theme) ? theme : `//unpkg.com/docsify/lib/themes/${theme}.css`,
    '//cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.css',
    ...(docsifyConfig.stylesheets || [])
  ];

  const scripts = [
    '//unpkg.com/docsify/lib/docsify.min.js',
    '//cdn.jsdelivr.net/npm/prismjs@1/components/prism-jsx.min.js',
    '//cdn.jsdelivr.net/npm/prismjs@1/components/prism-json.min.js',
    '//cdn.jsdelivr.net/npm/prismjs@1/components/prism-diff.min.js',
    '//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js',
    '//cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js',
    'scripts/toc-link-plugin.js',
    'scripts/mermaid-setup.js',
    ...(docsifyConfig.scripts || [])
  ];

  const tgtIndex = path.join(docsRoot, 'index.html');

  const html = await readFile(srcIndex, 'utf8');
  const template = Handlebars.compile(html);
  const content = template({ theme, config: windowConfig, stylesheets, scripts });
  await writeFile(tgtIndex, content);

  //
  // Determine remaining files to copy
  //
  const otherFiles = await glob('**/*', { cwd: srcDir, ignore: ['index.html'], nodir: true });
  //
  // make sure target dir structure in place
  //
  const tgtDirs = Array.from(new Set(otherFiles.map(f => path.dirname(path.join(docsRoot, f)))));
  await Promise.all(tgtDirs.map(d => mkdirp(d)));
  //
  // Copy remaining files over
  //
  await Promise.all(otherFiles.map(f => copyFile(path.join(srcDir, f), path.join(docsRoot, f))));

  return tgtIndex;
}

module.exports = generateContent;
