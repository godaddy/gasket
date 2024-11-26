const path = require('path');
const { devDependencies } = require('../package.json');

module.exports = async function create(gasket, context) {
  const generatorDir = path.join(__dirname, '..', 'generator');
  const {
    pkg,
    files,
    nextDevProxy,
    nextServerType,
    apiApp,
    gitignore,
    readme,
    testPlugins
  } = context;
  const depType = apiApp ? 'devDependencies' : 'dependencies';

  // Shared dependencies
  pkg.add(depType, {
    tsx: devDependencies.tsx,
    typescript: devDependencies.typescript
  });

  // Shared add TS links
  readme
    .link('tsx', 'https://tsx.is/')
    .link('@gasket/plugin-typescript', 'https://gasket.dev/docs/plugins/plugin-typescript/')
    .link('Gasket TypeScript', 'https://gasket.dev/docs/typescript/');

  // Scripts & files for API apps
  if (apiApp) {
    pkg.add('scripts', {
      prebuild: 'tsx gasket.ts build',
      build: 'tsc',
      preview: 'npm run build && npm run start',
      start: 'node dist/server.js',
      local: 'tsx watch server.ts'
    });

    if (testPlugins?.length && testPlugins.includes('@gasket/plugin-jest')) {
      context.addJestTSType = true;
    }

    files.add(`${generatorDir}/api/*`, `${generatorDir}/shared/*`);
    gitignore?.add('dist', 'TypeScript build output');
    pkg.add('eslintIgnore', ['dist']);
    await readme.markdownFile(path.join(generatorDir, 'markdown/README.md'));
  }

  // Files for Next.js customServer
  if (nextServerType === 'customServer') {
    files.add(`${generatorDir}/next/*`, `${generatorDir}/shared/*`);
    gitignore?.add('dist', 'TypeScript build output');
    pkg.add('eslintIgnore', ['dist']);
  }

  // Files for Next.js default server w/ https proxy
  if (nextDevProxy) {
    files.add(`${generatorDir}/next/*`, `${generatorDir}/shared/*`);
  }

  // Files for Next.js default server w/o dev proxy
  if (nextDevProxy === false && nextServerType !== 'customServer') {
    files.add(`${generatorDir}/next/*(tsconfig).json`);
  }
};
