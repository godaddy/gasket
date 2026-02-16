import path from 'path';
import { fileURLToPath } from 'url';
import packageJson from '../package.json' with { type: 'json' };
const { devDependencies } = packageJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, context) {
  const { pkg, files, packageManager } = context;

  let runCmd;
  if (packageManager === 'yarn') {
    runCmd = 'yarn';
  } else if (packageManager === 'pnpm') {
    runCmd = 'pnpm';
  } else {
    runCmd = 'npm run';
  }

  const fileName = fileURLToPath(import.meta.url);
  const generatorDir = path.join(fileName, '..', '..', 'generator');
  files.add(`${generatorDir}/*.md`);

  if (!context.typescript) {
    files.add(`${generatorDir}/*.js`);

    pkg.add('devDependencies', {
      nodemon: devDependencies.nodemon
    });

    pkg.add('scripts', {
      start: 'node server.js',
      local: 'nodemon server.js',
      preview: `${runCmd} start`
    });
  }
}
