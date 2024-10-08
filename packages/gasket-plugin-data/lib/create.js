/// <reference types="create-gasket-app" />

const { name, version, devDependencies } = require('../package.json');

/**
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
async function create(gasket, {
  pkg,
  files,
  gasketConfig,
  typescript,
  nextServerType,
  apiApp
}) {
  pkg.add('dependencies', {
    [name]: `^${version}`,
    '@gasket/data': devDependencies['@gasket/data']
  });

  const generatorDir = `${__dirname}/../generator`;
  const glob = typescript ? '*.ts' : '*.js';
  files.add(
    `${generatorDir}/${glob}`
  );

  gasketConfig
    .addPlugin('pluginData', name);

  // Default server TS use .ts
  // Else use .js
  let importFile = './gasket-data.js';
  if (typescript && nextServerType !== 'customServer' && !apiApp) {
    importFile = './gasket-data.ts';
  }

  gasketConfig
    .addImport('gasketData', `${importFile}`)
    .injectValue('data', 'gasketData');
}

module.exports = create;
