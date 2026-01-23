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
    readme,
    packageManager
  } = context;
  const depType = apiApp ? 'devDependencies' : 'dependencies';

  let runCmd;
  if (packageManager === 'yarn') {
    runCmd = 'yarn';
  } else if (packageManager === 'pnpm') {
    runCmd = 'pnpm';
  } else {
    runCmd = 'npm run';
  }

  // Shared dependencies
  pkg.add(depType, {
    tsx: devDependencies.tsx,
    typescript: devDependencies.typescript
  });

  // Add devDependencies for non-API apps
  if (!apiApp) {
    pkg.add('devDependencies', {
      concurrently: devDependencies.concurrently
    });
  }

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
      preview: `${runCmd} build && ${runCmd} start`,
      start: 'node dist/server.js',
      local: 'tsx watch server.ts'
    });

    files.add(`${generatorDir}/api/*`, `${generatorDir}/shared/*`);
    pkg.add('eslintIgnore', ['dist']);
    await readme.markdownFile(path.join(generatorDir, 'markdown/README.md'));
  }

  // Files for Next.js customServer
  if (nextServerType === 'customServer') {
    files.add(`${generatorDir}/next/*`, `${generatorDir}/shared/*`);
    pkg.add('eslintIgnore', ['dist']);
  }

  // Files for Next.js default server w/ https proxy
  // Also add concurrently for running multiple scripts
  if (nextDevProxy) {
    files.add(`${generatorDir}/next/*`, `${generatorDir}/shared/*`);
    pkg.add('eslintIgnore', ['dist']);
  }

  // Files for Next.js default server w/o dev proxy
  if (nextDevProxy === false && nextServerType !== 'customServer') {
    files.add(`${generatorDir}/next/*(tsconfig).json`);
  }
};
