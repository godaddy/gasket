import inquirer from 'inquirer';
import { withSpinner } from '../with-spinner.js';

/**
 * What is your app description?
 * @type {import('../../internal.js').chooseAppDescription}
 */
async function chooseAppDescription(context, prompt) {
  if (!('appDescription' in context)) {
    const { appDescription } = await prompt([
      {
        name: 'appDescription',
        message: 'What is your app description?',
        type: 'input',
        default: 'A basic gasket app'
      }
    ]);

    Object.assign(context, { appDescription });
  }
}

/**
 * What package manager do you want to use?
 * @type {import('../../internal.js').choosePackageManager}
 */
async function choosePackageManager(context, prompt) {
  const packageManager =
    context.packageManager ||
    (
      await prompt([
        {
          name: 'packageManager',
          message: 'Which packager would you like to use?',
          type: 'list',
          choices: [
            { name: 'npm' },
            { name: 'pnpm' },
            { name: 'yarn' }
          ],
          default: 'npm'
        }
      ])
    ).packageManager;

  const installCmd = context.installCmd || `${packageManager} install`;

  const localCmd = context.localCmd || `${packageManager} run local`;

  Object.assign(context, {
    packageManager,
    installCmd,
    localCmd
  });
}

/**
 * Given that gasket is creating in an already existing directory, it should
 * confirm with the user that it's intentionally overwriting that directory
 * @type {import('../../internal.js').allowExtantOverwriting}
 */
async function allowExtantOverwriting(context, prompt) {
  const { dest, extant } = context;
  if (extant && !('destOverride' in context)) {
    const { destOverride } = await prompt([
      {
        name: 'destOverride',
        type: 'confirm',
        message: `Override contents of ${dest} ?`,
        default: true
      }
    ]);

    Object.assign(context, { destOverride });
  }
}

export const questions = [
  chooseAppDescription,
  choosePackageManager,
  allowExtantOverwriting
];

/**
 * Fire off prompts for user input
 * @type {import('../../internal.js').globalPrompts}
 */
async function globalPrompts({ context }) {
  const prompt = context.prompts ? inquirer.createPromptModule() : () => ({});

  for (var fn of questions) {
    await fn(context, prompt);
  }
}

export default withSpinner('Global prompts', globalPrompts, { startSpinner: false });
