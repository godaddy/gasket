const inquirer = require('inquirer');
const { pluginIdentifier } = require('@gasket/resolve');
const action = require('../action-wrapper');
const { addPluginsToContext, flattenPresets } = require('../utils');

/**
 * What is your app description?
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function chooseAppDescription(context) {

  if (!('appDescription' in context)) {
    const { appDescription } = await inquirer.prompt([
      {
        name: 'appDescription',
        message: 'What is your app description?',
        type: 'input',
        default: 'A basic gasket app'
      }]);

    Object.assign(context, { appDescription });
  }
}

/**
 * What package manager do you want to use?
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function choosePackageManager(context) {
  if (!context.packageManager) {
    const { packageManager } = await inquirer.prompt([
      {
        name: 'packageManager',
        message: 'Which packager would you like to use?',
        type: 'list',
        choices: [
          { name: 'npm' },
          { name: 'yarn' }
        ]
      }]);

    const runners = {
      npm: 'npx',
      yarn: 'yarn'
    };

    Object.assign(context, {
      packageManager,
      installCmd: `${packageManager} install`,
      localCmd: `${runners[packageManager]} gasket local`
    });
  }
}

/**
 * Choose your unit test suite
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function chooseTestPlugin(context) {
  // Combine user-provided plugins with preset-provided plugins.
  const { presetInfos = [], plugins = [] } = context;

  // Flatten all plugins from presets and concat short names with cli plugins
  const allPlugins = flattenPresets(presetInfos)
    .map(presetInfo => presetInfo.plugins || [])
    .reduce((acc, arr) => acc.concat(arr), [])
    .map(pluginInfo => pluginIdentifier(pluginInfo.name).shortName)
    .concat(plugins);

  if (!('testPlugin' in context)) {
    if (!['mocha', 'jest'].some(p => allPlugins.includes(p))) {
      const { testPlugin } = await inquirer.prompt([
        {
          name: 'testPlugin',
          message: 'Choose your unit test suite',
          type: 'list',
          choices: [
            { name: 'none (not recommended)', value: 'none' },
            { name: 'mocha + nyc + sinon + chai', value: 'mocha' },
            { name: 'jest' }
          ]
        }]);

      if (testPlugin && testPlugin !== 'none') {
        addPluginsToContext([testPlugin], context);
        Object.assign(context, { testPlugin });
      }
    }
  }
}

/**
 * Given that gasket is creating in an already existing directory, it should
 * confirm with the user that it's intentionally overwriting that directory
 *
 * @param  {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function allowExtantOverwriting(context) {
  const { dest, extant } = context;
  if (extant) {
    const { destOverride } = await inquirer.prompt([{
      name: 'destOverride',
      type: 'confirm',
      message: `Override contents of ${dest} ?`,
      default: true
    }]);

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
  for (var fn of questions) {
    await fn(context);
  }
}

module.exports = action('Global prompts', globalPrompts, { startSpinner: false });

module.exports.questions = questions;
