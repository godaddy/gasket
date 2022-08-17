/* eslint-disable max-len, max-statements */
const fs = require('fs');
const path = require('path');
const { addPluginsToContext, ensureAbsolute, readConfig } = require('../scaffold/utils');

/**
 * The CreateRuntime represents a shallow proxy to a CreateContext
 * that automatically adds transactional information for providing
 * CLI users with blame information in the event of conflicts.
 *
 * @param {CreateContext} context - Create context.
 * @param {Plugin} source - Gasket plugin the create context is within.
 * @returns {Proxy} Shallow proxy to the `context` provided that will
 * pass `source` to `context.{files,pkg}.*` methods.
 */
function makeCreateRuntime(context, source) {
  //
  // Create a set of overrides for our Proxy
  //
  const overrides = {
    source,
    files: {
      add(...globs) {
        context.files.add({ globs, source });
      }
    },
    pkg: {
      extend(fields) {
        context.pkg.extend(fields, source);
      },

      add(key, value, options) {
        context.pkg.add(key, value, source, options);
      },

      has(key, value) {
        return context.pkg.has(key, value);
      }
    }
  };

  return new Proxy(context, {
    get(obj, key) {
      if (overrides[key]) return overrides[key];
      return obj[key];
    },
    set(obj, key, value) {
      if (key !== 'pkg' && key !== 'files' && key !== 'source') {
        obj[key] = value;
      }
    }
  });
}

function flatten(acc, values) {
  return acc.concat(values);
}

/**
 * Create Context
 *
 * @type {CreateContext}
 *
 * -- Added by command args and flags
 *
 * @property {String} appName - Short name of the app
 * @property {String} cwd - Current work directory
 * @property {String} dest - Path to the target app (Default: cwd/appName)
 * @property {String} relDest - Relative path to the target app
 * @property {Boolean} extant - Whether or not target directory already exists
 * @property {[String]} localPresets - paths to the local presets packages
 * @property {PresetDesc[]} rawPresets - Raw preset desc from args. Can include version constraint. Added by load-preset if using localPresets.
 * @property {PluginDesc[]} rawPlugins - Raw plugin desc from flags, prompts, etc. Can include constraints.
 * @property {PluginName[]} plugins - Short names of plugins
 * @property {String[]} pkgLinks - Local packages that should be linked
 * @property {String} npmconfig - Path to npmconfig file
 * @property {String[]} messages - non-error/warning messages to report
 * @property {String[]} warnings - warnings messages to report
 * @property {String[]} errors - error messages to report but do not exit process
 * @property {String[]} nextSteps - any next steps to report for user
 * @property {Set<String>} generatedFiles - any generated files to show in report
 *
 * -- Added by `global-prompts`
 *
 * @property {String} appDescription - Description of app
 * @property {Boolean} gitInit - Should a git repo be initialized and first commit
 * @property {String} testPlugin - Name of the plugin for unit tests
 * @property {String} packageManager - Which package manager to use (Default: 'npm')
 * @property {String} installCmd - Derived install command (Default: 'npm install')
 * @property {String} localCmd - Derived local run command (Default: 'npx gasket local')
 * @property {Boolean} destOverride - Whether or not the user wants to override an extant directory
 *
 * -- Added by `load-preset`
 *
 * @property {PresetName[]} presets - Short name of presets
 * @property {PresetInfo[]} presetInfos - Shallow load of presets with meta data
 *
 * -- Added by `cli-version`
 *
 * @property {string} cliVersion - Version of current CLI used to issue `create` command
 * @property {string} cliVersionRequired - Version of CLI to install, either current or min compatible version required by preset(s)
 *
 * -- Added by `setup-pkg`
 *
 * @property {ConfigBuilder} pkg - package.json builder
 * @property {PackageManager} pkgManager - manager to execute npm or yarn commands
 *
 * -- Added by `setup-gasket-config`
 *
 * @property {ConfigBuilder} gasketConfig - gasket.config builder
 *
 * -- Added by `create-hooks`
 *
 * @property {Files} files - Use to add files and templates to generate
 */
class CreateContext {
  constructor(initContext = {}) {
    Object.assign(this, initContext);
  }

  runWith(plugin) {
    return makeCreateRuntime(this, plugin);
  }
}

/**
 * Makes the initial context used through the create command flow.
 *
 * @param {String[]} argv - Commands args
 * @param {Object} flags - Command flags
 * @returns {CreateContext} context
 */
module.exports = function makeCreateContext(argv = [], flags = {}) {
  const appName = argv[0] || 'templated-app';
  const {
    npmconfig,
    plugins = [],
    presets = [],
    'npm-link': npmLink = [],
    'preset-path': presetPath = [],
    'package-manager': packageManager,
    prompts,
    config,
    'config-file': configFile
  } = flags;

  // Flatten the array of array created by the plugins flag – it
  // supports both multiple instances as well as comma-separated lists.
  const rawPresets = presets.reduce(flatten, []);
  const localPresets = presetPath.reduce(flatten, []);
  const rawPlugins = plugins.reduce(flatten, []);
  const pkgLinks = npmLink.reduce(flatten, []);
  const cwd = process.cwd();
  const dest = path.join(cwd, appName);
  const relDest = `.${path.sep}${path.relative(cwd, dest)}`;
  // eslint-disable-next-line no-sync
  const extant = fs.existsSync(dest);

  /**
   * Input context which will be appended by prompts and passed to create hooks
   *
   * @type {CreateContext}
   */
  const context = new CreateContext({
    destOverride: true,
    cwd,
    dest,
    relDest,
    extant,
    npmconfig: npmconfig && ensureAbsolute(npmconfig),
    pkgLinks,
    localPresets,
    rawPresets,
    messages: [],
    warnings: [],
    errors: [],
    nextSteps: [],
    generatedFiles: new Set(),
    prompts
  });

  readConfig(context, { config, configFile });

  if (packageManager) {
    context.packageManager = packageManager;
  }
  if (appName) {
    context.appName = appName;
  }

  addPluginsToContext(rawPlugins, context);

  return context;
};

module.exports.CreateContext = CreateContext;
