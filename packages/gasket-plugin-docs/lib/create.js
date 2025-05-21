/// <reference types="create-gasket-app"/>
/// <reference types="@gasket/plugin-git" />

const { name, version, devDependencies } = require('../package.json');

const { DEFAULT_CONFIG } = require('./utils/constants');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = function create(gasket, {
  pkg,
  gasketConfig,
  gitignore,
  typescript,
  useDocs,
  readme
}) {
  if (!useDocs) return;

  gitignore?.add(DEFAULT_CONFIG.outputDir, 'documentation');
  gasketConfig.addCommand('docs', {
    dynamicPlugins: [
      `${name}`,
      '@gasket/plugin-metadata'
    ]
  });
  pkg.add('devDependencies', {
    [name]: `^${version}`,
    '@gasket/plugin-metadata': devDependencies['@gasket/plugin-metadata']
  });

  const docsScript = typescript
    ? 'node --import tsx gasket.ts docs'
    : 'node gasket.js docs';
  pkg.add('scripts', {
    docs: docsScript
  });

  readme.subHeading('Documentation')
    .content('Generated docs will be placed in the `.docs` directory. To generate markdown documentation for the API, run:')
    .codeBlock('{{{packageManager}}} run docs', 'bash');
};
