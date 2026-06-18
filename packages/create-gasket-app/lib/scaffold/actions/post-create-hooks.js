import { withGasketSpinner } from '../with-spinner.js';
import { runShellCommand } from '@gasket/utils';

/** @type {import('../../internal.d.ts').postCreateHooks} */
async function postCreateHooks({ gasket, context }) {
  const { dest, packageManager } = context;

  /** @type {import('../../internal.d.ts').runScript} */
  async function runScript(script) {
    let cmd;

    switch (packageManager) {
      case 'yarn':
        cmd = 'yarn';
        break;
      case 'pnpm':
        cmd = 'pnpm';
        break;
      case 'npm':
      default:
        cmd = 'npm';
        break;
    }

    return await runShellCommand(cmd, ['run', script], { cwd: dest });
  }

  const utils = { runScript };
  await gasket.exec('postCreate', context, utils);
}

export default withGasketSpinner('Execute postCreate hooks', postCreateHooks);
