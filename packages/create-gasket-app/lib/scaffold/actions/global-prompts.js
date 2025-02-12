import inquirer from 'inquirer';
import { withSpinner } from '../with-spinner.js';

/**
 * What is your app description?
 * @type {import('../../internal').chooseAppDescription}
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
 * @type {import('../../internal').choosePackageManager}
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
          ]
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
 * Choose your unit test suite and integration test suite
 * @type {import('../../internal').chooseTestPlugins}
 */
async function chooseTestPlugins(context, prompt) {
  const knownTestPlugins = {
    unit: {
      jest: '@gasket/plugin-jest',
      mocha: '@gasket/plugin-mocha'
    },
    integration: {
      cypress: '@gasket/plugin-cypress'
    }
  };

  const testTypes = ['unit', 'integration'];
  const testPlugins = [];

  if (!('testPlugins' in context)) {
    for (const type of testTypes) {
      if (type + 'TestSuite' in context) {
        const testSuite = knownTestPlugins[type][context[type + 'TestSuite']];
        if (testSuite) testPlugins.push(testSuite);
      } else {
        const plugin = await promptForTestPlugin(
          prompt,
          `Choose your ${type} test suite`,
          Object.entries(knownTestPlugins[type]).map(([name, value]) => ({ name, value }))
        );

        if (plugin) testPlugins.push(plugin);
      }
    }

    if (testPlugins.length > 0) {
      Object.assign(context, { testPlugins });
    }
  }
}

/**
 *
 * @type {import('../../internal').promptForTestPlugin}
 */
async function promptForTestPlugin(prompt, message, choices) {
  const { testPlugin } = await prompt([
    {
      name: 'testPlugin',
      message,
      type: 'list',
      choices: [{ name: 'none', value: 'none' }, ...choices]
    }
  ]);

  return testPlugin !== 'none' ? testPlugin : null;
}

/**
 * Given that gasket is creating in an already existing directory, it should
 * confirm with the user that it's intentionally overwriting that directory
 * @type {import('../../internal').allowExtantOverwriting}
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
  chooseTestPlugins,
  allowExtantOverwriting
];

/**
 * Fire off prompts for user input
 * @type {import('../../internal').globalPrompts}
 */
async function globalPrompts({ context }) {
  const prompt = context.prompts ? inquirer.createPromptModule() : () => ({});

  for (var fn of questions) {
    await fn(context, prompt);
  }
}

export default withSpinner('Global prompts', globalPrompts, { startSpinner: false });
