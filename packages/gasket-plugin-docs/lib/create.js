/// <reference types="create-gasket-app"/>

import packageJson from '../package.json' with { type: 'json' };
const { name, version, devDependencies } = packageJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, {
  pkg,
  gasketConfig,
  typescript,
  useDocs,
  readme
}) {
  if (!useDocs) return;

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
    ? 'tsx gasket.ts docs'
    : 'node gasket.js docs';
  pkg.add('scripts', {
    docs: docsScript
  });

  readme.subHeading('Documentation')
    .content('Generated docs will be placed in the `.docs` directory. To generate markdown documentation for the API, run:')
    .codeBlock('{{{packageManager}}} run docs', 'bash');
}
