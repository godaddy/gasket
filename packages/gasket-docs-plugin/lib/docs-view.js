const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const isCssFile = /.css$/;

module.exports = async function docsView(gasket, docsConfig) {
  const { docs: { docsify = {} } } = gasket.config;
  const { docsRoot } = docsConfig;

  // docsify, and thus this viewer, can be disable by setting it to false in config
  if (!docsify) return;

  const { serve } = require('docsify-cli/lib');
  const Handlebars = require('handlebars');
  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context, null, 2);
  });

  const { theme, config, port } = docsify;
  const configDefaults = {
    name: docsConfig.app.name,
    nameLink: '/'
  };

  const stylesheets = [
    isCssFile.test(theme) ? theme : `//unpkg.com/docsify/lib/themes/${theme}.css`,
    ...(docsify.stylesheets || [])
  ];

  const scripts = [
    '//unpkg.com/docsify/lib/docsify.min.js',
    ...(docsify.scripts || [])
  ];

  const srcFile = path.join(__dirname, '..', 'generator', 'index.html');
  const tgtFile = path.join(docsRoot, 'index.html');

  const html = await readFile(srcFile, 'utf8');
  const template = Handlebars.compile(html);
  const content = template({ theme, config: { ...configDefaults, ...config }, stylesheets, scripts });
  await writeFile(tgtFile, content);

  serve(docsRoot, true, port);
};
