import inquirer from 'inquirer';
import action from '../action-wrapper.js';

/**
 * What is your app description?
 *
 * @param {CreateContext} context - Create context
 * @param {function} prompt - function to prompt user
 * @returns {Promise} promise
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
 *
 * @param {CreateContext} context - Create context
 * @param {function} prompt - function to prompt user
 * @returns {Promise} promise
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
          choices: [{ name: 'npm' }, { name: 'pnpm' }, { name: 'yarn' }]
        }
      ])
    ).packageManager;

  const installCmd = context.installCmd || `${packageManager} install`;

  const runners = {
    npm: 'npx',
    yarn: 'yarn',
    pnpm: 'pnpm exec'
  };

  const localCmd = context.localCmd || `${runners[packageManager]} gasket local`;

  Object.assign(context, {
    packageManager,
    installCmd,
    localCmd
  });
}

/**
 * Choose your unit test suite and integration test suite
 *
 * @param {CreateContext} context - Create context
 * @param {function} prompt - function to prompt user
 * @returns {Promise} promise
 */
async function chooseTestPlugins(context, prompt) {
  const knownTestPlugins = {
    unit: { mocha: '@gasket/plugin-mocha', jest: '@gasket/plugin-jest' },
    integration: { cypress: '@gasket/plugin-cypress' }
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
 *
 * @param  {CreateContext} context - Create context
 * @param {function} prompt - function to prompt user
 * @returns {Promise} promise
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
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function globalPrompts({ context }) {
  const prompt = context.prompts ? inquirer.prompt : () => ({});
  for (var fn of questions) {
    await fn(context, prompt);
  }
}

export default action('Global prompts', globalPrompts, { startSpinner: false });
