const defaultsDeep = require('lodash.defaultsdeep');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
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
  const { theme = 'vue', config = {} } = docsifyConfig;
  const { docsRoot } = docsConfigSet;

  const Handlebars = require('handlebars');
  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context, null, 2);
  });

  const windowConfig = defaultsDeep({
    name: docsConfigSet.app.name,
    nameLink: '/'
  }, config);

  const stylesheets = [
    isCssFile.test(theme) ? theme : `//unpkg.com/docsify/lib/themes/${theme}.css`,
    ...(docsifyConfig.stylesheets || [])
  ];

  const scripts = [
    '//unpkg.com/docsify/lib/docsify.min.js',
    ...(docsifyConfig.scripts || [])
  ];

  const tgtIndex = path.join(docsRoot, 'index.html');

  const html = await readFile(srcIndex, 'utf8');
  const template = Handlebars.compile(html);
  const content = template({ theme, config: windowConfig, stylesheets, scripts });
  await writeFile(tgtIndex, content);

  //
  // Copy remaining files over
  //
  const otherFiles = await glob('**/*', { cwd: srcDir, ignore: ['index.html'] });
  await Promise.all(otherFiles.map(f => copyFile(path.join(srcDir, f), path.join(docsRoot, f))));

  return tgtIndex;
}

module.exports = generateContent;
