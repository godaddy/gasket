const { pluginIdentifier, flattenPresets } = require('@gasket/resolve');
const action = require('../action-wrapper');
const { addPluginsToContext } = require('../utils');


/**
 * Get package manager from json object
 *
 * @param {CreateContext} context - Create context
 * @param {Object} ciConfig - command line configuration object
 * @returns {Promise} promise
 */
async function getPackageManager(context, ciConfig) {
  const packageManager = context.packageManager || ciConfig.packageManager || ciConfig.package;

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
 * Get unit test suite from json object
 *
 * @param {CreateContext} context - Create context
 * @param {Object} ciConfig - command line configuration object
 * @returns {Promise} promise
 */
async function getTestPlugin(context, ciConfig) {
  // Combine user-provided plugins with preset-provided plugins.
  const { presetInfos = [], plugins = [] } = context;

  // Flatten all plugins from presets and concat short names with cli plugins
  const allPlugins = flattenPresets(presetInfos)
    .map((presetInfo) => presetInfo.plugins || [])
    .reduce((acc, arr) => acc.concat(arr), [])
    .map((pluginInfo) => pluginIdentifier(pluginInfo.name).shortName)
    .concat(plugins);

  const testPlugins = { mocha: '@gasket/mocha', jest: '@gasket/jest', cypress: '@gasket/cypress' };

  if (!('testPlugin' in context)) {
    let testPlugin = Object.values(testPlugins).find((p) => allPlugins.includes(p));

    if (!testPlugin) {
      testPlugin = ciConfig.testPlugin ? Object.values(testPlugins).find((p) => ciConfig.testPlugin === p) : testPlugins[ciConfig.testSuite];
    }

    if (testPlugin && testPlugin !== 'none') {
      addPluginsToContext([testPlugin], context);
      Object.assign(context, { testPlugin });
    }
  }
}

const loaders = [
  getPackageManager,
  getTestPlugin
];

/**
 * Read values from user config object
 *
 * @param {CreateContext} context - Create context
 * @param {Object} ciConfig - command line configuration object
 * @returns {Promise} promise
 */
async function readConfigObject(context) {
  const { packageManager, package, testPlugin, testSuite} = context;
  await getPackageManager(context, { packageManager, package });
  await getTestPlugin(context, { testPlugin, testSuite });
}

module.exports = action('Read config object', readConfigObject, { startSpinner: false });

module.exports.loaders = loaders;
