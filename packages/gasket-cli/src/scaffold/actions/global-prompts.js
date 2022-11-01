const inquirer = require('inquirer');
const { pluginIdentifier, flattenPresets } = require('@gasket/resolve');
const action = require('../action-wrapper');
const { addPluginsToContext } = require('../utils');

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
          choices: [{ name: 'npm' }, { name: 'yarn' }]
        }
      ])
    ).packageManager;

  const installCmd = context.installCmd || `${packageManager} install`;

  const runners = {
    npm: 'npx',
    yarn: 'yarn'
  };

  const localCmd = context.localCmd || `${runners[packageManager]} gasket local`;

  Object.assign(context, {
    packageManager,
    installCmd,
    localCmd
  });
}

/**
 * Choose your unit test suite
 *
 * @param {CreateContext} context - Create context
 * @param {function} prompt - function to prompt user
 * @returns {Promise} promise
 */
async function chooseTestPlugin(context, prompt) {
  // Combine user-provided plugins with preset-provided plugins.
  const { presetInfos = [], plugins = [] } = context;

  // Flatten all plugins from presets and concat short names with cli plugins
  const allPlugins = flattenPresets(presetInfos)
    .map((presetInfo) => presetInfo.plugins || [])
    .reduce((acc, arr) => acc.concat(arr), [])
    .map((pluginInfo) => pluginIdentifier(pluginInfo.name).shortName)
    .concat(plugins);

  const knownTestPlugins = { mocha: '@gasket/mocha', jest: '@gasket/jest', cypress: '@gasket/cypress' };

  if (!('testPlugin' in context)) {
    let testPlugin = Object.values(knownTestPlugins).find((p) => allPlugins.includes(p));

    if ('testSuite' in  context) {
      testPlugin = knownTestPlugins[context.testSuite];
    }

    if (!testPlugin) {
      ({ testPlugin } = await prompt([
        {
          name: 'testPlugin',
          message: 'Choose your unit test suite',
          type: 'list',
          choices: [
            { name: 'none (not recommended)', value: 'none' },
            { name: 'mocha + nyc + sinon + chai', value: '@gasket/mocha' },
            { name: 'jest', value: '@gasket/jest' },
            { name: 'cypress', value: '@gasket/cypress' }
          ]
        }
      ]));
    }

    if (testPlugin && testPlugin !== 'none') {
      addPluginsToContext([testPlugin], context);
      Object.assign(context, { testPlugin });
    }
  }
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

const questions = [
  chooseAppDescription,
  choosePackageManager,
  chooseTestPlugin,
  allowExtantOverwriting
];

/**
 * Fire off prompts for user input
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function globalPrompts(context) {
  const prompt = context.prompts ? inquirer.prompt : () => ({});
  for (var fn of questions) {
    await fn(context, prompt);
  }
}

module.exports = action('Global prompts', globalPrompts, { startSpinner: false });

module.exports.questions = questions;
